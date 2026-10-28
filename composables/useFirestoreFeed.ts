import type { FeedMessage } from '~/types/elections'
import { normaliseFirestoreFeedMessage } from '~/utils/elections/normaliseFirestore'
import type { FirestoreSubscription } from './useFirestoreResults'

/** How many entries a reader holds. Also the Firestore query's limit. */
export const FEED_LIMIT = 20

/**
 * How hard to try again after the listener fails outright.
 *
 * Five attempts at a widening interval, so roughly four minutes in all. That
 * is sized for the one error worth recovering from: a composite index deployed
 * shortly before polls close, which takes a few minutes to build and which
 * the SDK reports as a terminal failure in the meantime.
 */
const RETRY_ATTEMPTS = 5
const RETRY_DELAY_MS = 15_000

/**
 * The running commentary on a count, while it is live.
 *
 * A query listener on `feed` for one event, newest first, capped at twenty.
 * Modelled on `useFirestoreSummary`: the same generation guard, the same
 * dynamic import so the SDK stays out of the server bundle, the same cleanup
 * in `onScopeDispose`.
 *
 * What it costs is worth being explicit about, because it is the one listener
 * here whose bill scales with how much happens rather than with how many
 * documents exist. Opening the page is twenty reads, and every entry the
 * worker writes afterwards is one more read for every page still open. The
 * limit is therefore the budget: it caps the opening cost, and the worker
 * batching its writes is what caps the rest.
 *
 * Live mode only. Nothing publishes the feed to R2, so an archived event has
 * no feed to read rather than a stale one.
 */
export function useFirestoreFeed(options: {
  eventId: MaybeRefOrGetter<string | null>
  enabled: MaybeRefOrGetter<boolean>
}): FirestoreSubscription & { messages: Ref<FeedMessage[]> } {
  const messages = ref<FeedMessage[]>([])
  const connection = ref<'connecting' | 'live' | 'offline' | 'archived'>('archived')
  let unsubscribe: (() => void) | null = null
  let generation = 0
  let attachedTo: string | null = null
  let retry: ReturnType<typeof setTimeout> | null = null
  let attemptsLeft = RETRY_ATTEMPTS

  function detach() {
    if (retry) {
      clearTimeout(retry)
      retry = null
    }
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  /**
   * Try again, a few times, after a terminal error.
   *
   * The SDK retries a dropped connection on its own, but the errors it hands
   * to the callback are the ones it has given up on -- and the likeliest of
   * them, a composite index that has not finished building, is temporary in a
   * way the SDK cannot know. Without this, a reader who had the dashboard open
   * while the index was deployed would sit in front of a broken panel until
   * they thought to reload, which on election night they will not.
   *
   * Bounded rather than indefinite, because each attempt is the opening twenty
   * reads again, and because a genuinely denied read will never succeed.
   */
  function scheduleRetry(mine: number) {
    if (retry || attemptsLeft <= 0) return
    const delay = RETRY_DELAY_MS * (RETRY_ATTEMPTS - attemptsLeft + 1)
    attemptsLeft -= 1
    retry = setTimeout(() => {
      retry = null
      if (mine === generation) attach()
    }, delay)
  }

  async function attach() {
    detach()

    const eventId = toValue(options.eventId)
    if (!import.meta.client || !toValue(options.enabled) || !eventId) {
      connection.value = 'archived'
      // Entries are kept when the same event simply stops being live, so that
      // a reader watching all evening still has the last twenty in front of
      // them at the moment the count is declared. They are cleared when the
      // event changes, because the numbers in them mean nothing outside the
      // event they were written for.
      if (eventId !== attachedTo) {
        messages.value = []
        attachedTo = null
      }
      return
    }

    // A different event is a fresh subscription, and gets a fresh budget of
    // attempts rather than inheriting one spent on the previous one.
    if (eventId !== attachedTo) attemptsLeft = RETRY_ATTEMPTS
    attachedTo = eventId

    // Each attach claims a generation, so a subscription that resolves after a
    // newer one started tears itself down instead of writing stale entries.
    const mine = ++generation
    connection.value = 'connecting'

    try {
      const { collection, limit, onSnapshot, orderBy, query, where }
        = await import('firebase/firestore')
      const { $firestore } = useNuxtApp()
      const db = ($firestore as () => import('firebase/firestore').Firestore)()

      if (mine !== generation) return

      unsubscribe = onSnapshot(
        query(
          collection(db, 'feed'),
          where('event_id', '==', eventId),
          orderBy('timestamp', 'desc'),
          limit(FEED_LIMIT),
        ),
        (snapshot) => {
          if (mine !== generation) return

          // The whole window every time, not `docChanges()`: a limited query
          // drops an entry off the bottom as one arrives at the top, and
          // merging those changes by hand would reimplement what the snapshot
          // already states. Twenty entries is nothing to rebuild.
          messages.value = snapshot.docs
            .map(document => normaliseFirestoreFeedMessage(document.id, document.data()))
            .filter((message): message is FeedMessage => message !== null)

          connection.value = snapshot.metadata.fromCache ? 'connecting' : 'live'

          // A listener that has delivered has earned its attempts back, so a
          // failure hours later is retried rather than refused on a budget
          // spent at the start of the evening.
          if (!snapshot.metadata.fromCache) attemptsLeft = RETRY_ATTEMPTS
        },
        (error) => {
          if (mine !== generation) return
          // Firestore reports a missing index as failed-precondition and says
          // nothing about indexes, so the one cause worth naming is named. It
          // is also the likeliest: the query filters on one field and orders
          // by another, so it cannot run without the composite index, and an
          // index that has not been deployed looks from here exactly like a
          // feed with nothing in it.
          if (error.code === 'failed-precondition') {
            console.warn('[elections] the live feed needs its composite index on'
              + ' `feed` (event_id ascending, timestamp descending). Deploy'
              + ' firestore.indexes.json from the Django repository.')
          } else {
            console.warn('[elections] live feed unavailable:', error.code)
          }
          connection.value = 'offline'
          scheduleRetry(mine)
        },
      )
    } catch (error) {
      if (mine !== generation) return
      console.warn('[elections] could not start the live feed:', error)
      connection.value = 'offline'
      scheduleRetry(mine)
    }
  }

  watch(
    () => [toValue(options.eventId), toValue(options.enabled)],
    () => { attach() },
    { immediate: true },
  )

  // onScopeDispose rather than onBeforeUnmount, as for results and the
  // summary: this is held by a composable that outlives the child routes. A
  // leaked listener keeps billing.
  onScopeDispose(() => {
    generation += 1
    detach()
  })

  return { messages, connection, stop: () => { generation += 1; detach() } }
}
