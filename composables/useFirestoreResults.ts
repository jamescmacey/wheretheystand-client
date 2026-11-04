import type { ConnectionState, EntityNumber, ResultsSet } from '~/types/elections'
import { normaliseFirestoreResultsSet } from '~/utils/elections/normaliseFirestore'

/**
 * Live results, while an event is being counted.
 *
 * Listeners are scoped to what a page actually shows, because Firestore bills
 * per document read and re-bills every changed document a listener sees. The
 * overview needs one document; an electorate needs two. A listener over every
 * electorate would cost two orders of magnitude more for a page most people
 * never open.
 *
 * Nothing here runs on the server. The SDK is imported dynamically so it stays
 * out of the server bundle entirely.
 */

export type ResultsScope =
  | { kind: 'national' }
  | { kind: 'electorate', electorate: EntityNumber }
  | { kind: 'all-electorates' }
  | { kind: 'voting-place', votingPlace: EntityNumber }

export interface FirestoreSubscription {
  connection: Ref<ConnectionState>
  stop: () => void
}

/** How many documents a scope is expected to match, for logging and budgeting. */
export function scopeSize(scope: ResultsScope): number {
  switch (scope.kind) {
    case 'national': return 1
    case 'electorate': return 2
    case 'all-electorates': return 144
    // Two per electorate the place issues for, which is usually its own
    // general and Māori seats, and more at an advance voting place. An
    // estimate, not a bound: it is for budgeting, and the real figure is not
    // known until the documents arrive.
    case 'voting-place': return 8
  }
}

/**
 * Subscribe to a scope of results and hand each change to `onResults`.
 *
 * Returns immediately; the subscription attaches asynchronously because the SDK
 * is loaded on demand.
 */
export function useFirestoreResults(options: {
  eventId: MaybeRefOrGetter<string | null>
  scope: MaybeRefOrGetter<ResultsScope>
  enabled: MaybeRefOrGetter<boolean>
  onResults: (sets: ResultsSet[]) => void
  /** Called when the live connection cannot be relied on. */
  onOffline?: () => void
}): FirestoreSubscription {
  const connection = ref<ConnectionState>('archived')
  let unsubscribe: (() => void) | null = null
  let generation = 0

  function detach() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  async function attach() {
    detach()

    const eventId = toValue(options.eventId)
    if (!import.meta.client || !toValue(options.enabled) || !eventId) {
      connection.value = 'archived'
      return
    }

    // Each attach claims a generation, so a subscription that resolves after a
    // newer one started tears itself down instead of writing stale results.
    const mine = ++generation
    connection.value = 'connecting'

    try {
      // Inside the client branch and dynamic, so Nitro never bundles the SDK
      // for the server.
      const { collection, onSnapshot, query, where } = await import('firebase/firestore')
      const { $firestore } = useNuxtApp()
      const db = ($firestore as () => import('firebase/firestore').Firestore)()

      if (mine !== generation) return

      const scope = toValue(options.scope)
      const constraints = [where('event_id', '==', eventId)]
      if (scope.kind === 'national') {
        constraints.push(where('results_level', '==', 'national'))
        constraints.push(where('results_category', '==', 'party_votes'))
      } else if (scope.kind === 'electorate') {
        constraints.push(where('results_level', '==', 'electorate'))
        constraints.push(where('electorate_id', '==', scope.electorate))
      } else if (scope.kind === 'voting-place') {
        // Deliberately not narrowed by electorate: the point of a voting place
        // page is every electorate it issued votes for, and which those are is
        // not known before the documents arrive. Needs its own composite index
        // -- (event_id, results_level, voting_place_id) is not a prefix of the
        // electorate-and-place one, because electorate_id sits in between.
        //
        // Filters `voting_place_id` rather than `voting_place_no`: a where
        // clause can only name one field, and that is the one the Django
        // importer treats as the place. A document carrying only the other
        // name would not match.
        constraints.push(where('results_level', '==', 'voting_place'))
        constraints.push(where('voting_place_id', '==', scope.votingPlace))
      } else {
        constraints.push(where('results_level', '==', 'electorate'))
      }

      unsubscribe = onSnapshot(
        query(collection(db, 'results'), ...constraints),
        snapshot => {
          if (mine !== generation) return

          // Only what changed, rather than the whole result set on every
          // update: the store merges, so re-sending unchanged rows is waste.
          const changed = snapshot.docChanges()
            .filter(change => change.type !== 'removed')
            .map(change => normaliseFirestoreResultsSet(change.doc.id, change.doc.data()))

          if (changed.length) options.onResults(changed)

          // fromCache means the SDK has not confirmed against the server yet.
          connection.value = snapshot.metadata.fromCache ? 'connecting' : 'live'
        },
        error => {
          if (mine !== generation) return
          console.warn('[elections] live results unavailable:', error.code)
          connection.value = 'offline'
          options.onOffline?.()
        },
      )
    } catch (error) {
      if (mine !== generation) return
      console.warn('[elections] could not start live results:', error)
      connection.value = 'offline'
      options.onOffline?.()
    }
  }

  watch(
    () => [toValue(options.eventId), toValue(options.enabled), JSON.stringify(toValue(options.scope))],
    () => { attach() },
    { immediate: true },
  )

  // onScopeDispose rather than onBeforeUnmount: this is used from a composable
  // provided by a parent that outlives the child routes, and it also cleans up
  // across hot reloads. A leaked listener keeps billing.
  onScopeDispose(() => {
    generation += 1
    detach()
  })

  return { connection, stop: () => { generation += 1; detach() } }
}
