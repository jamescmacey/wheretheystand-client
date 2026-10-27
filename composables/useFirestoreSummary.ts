import type { ResultsSummary } from '~/types/elections'
import { normaliseFirestoreSummary } from '~/utils/elections/normaliseFirestore'
import type { FirestoreSubscription } from './useFirestoreResults'

/**
 * The per-electorate summary, while an event is being counted.
 *
 * One document, maintained by `election-summary-worker`, carrying every
 * electorate's top two candidates and how much of it is counted. It exists so
 * that a page wanting every margin does not have to subscribe to every
 * electorate: the worker pays those 72 reads once a minute on everybody's
 * behalf, and a visitor pays one document.
 *
 * That is the difference between the overview costing one document and costing
 * 145, and it is why the overview no longer asks people to opt in to loading
 * electorate results.
 *
 * A document listener rather than a query, so there is no index to deploy and
 * no filter to get wrong. Nothing here runs on the server, and the SDK is
 * imported dynamically so it stays out of the server bundle.
 */
export function useFirestoreSummary(options: {
  eventId: MaybeRefOrGetter<string | null>
  enabled: MaybeRefOrGetter<boolean>
  onSummary: (summary: ResultsSummary) => void
}): FirestoreSubscription {
  const connection = ref<'connecting' | 'live' | 'offline' | 'archived'>('archived')
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
      const { doc, onSnapshot } = await import('firebase/firestore')
      const { $firestore } = useNuxtApp()
      const db = ($firestore as () => import('firebase/firestore').Firestore)()

      if (mine !== generation) return

      unsubscribe = onSnapshot(
        doc(db, 'results_summary', eventId),
        (snapshot) => {
          if (mine !== generation) return

          const data = snapshot.data()
          // A missing document is not a failure. The worker writes it on its
          // first pass of an event, which may be after the first visitor
          // arrives, and every page falls back to what it can read directly.
          if (data) options.onSummary(normaliseFirestoreSummary(data))

          connection.value = snapshot.metadata.fromCache ? 'connecting' : 'live'
        },
        (error) => {
          if (mine !== generation) return
          console.warn('[elections] live summary unavailable:', error.code)
          connection.value = 'offline'
        },
      )
    } catch (error) {
      if (mine !== generation) return
      console.warn('[elections] could not start the live summary:', error)
      connection.value = 'offline'
    }
  }

  watch(
    () => [toValue(options.eventId), toValue(options.enabled)],
    () => { attach() },
    { immediate: true },
  )

  // onScopeDispose rather than onBeforeUnmount, as for results: this is held by
  // a composable that outlives the child routes. A leaked listener keeps billing.
  onScopeDispose(() => {
    generation += 1
    detach()
  })

  return { connection, stop: () => { generation += 1; detach() } }
}
