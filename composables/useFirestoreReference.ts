import type { LiveEventDocument, PersistentData, ReferenceData } from '~/types/elections'
import {
  buildPersistentIndex,
  normaliseFirestoreReferenceData,
} from '~/utils/elections/normaliseFirestore'
import { normaliseVersionPaths } from '~/utils/elections/normaliseSnapshot'

/**
 * The event document, and reference data read straight from Firestore.
 *
 * During a live count the event document is the client's freshest source of
 * truth about the event itself: whether it is live at all, whether reference
 * data has been built, and where this version's payloads were last published.
 * Django is not in the request path on the night, so nothing else can answer
 * the first two at all, and only the manifest -- edge cached, so staler -- can
 * answer the third.
 *
 * Both functions are client only and load the SDK on demand.
 */

/**
 * Watch the event document for the duration of a live count.
 *
 * A single-document listener: one read, plus one per change -- the cheapest
 * thing Firestore can be asked for.
 *
 * It does not decide whether to enter live mode; the manifest does that, before
 * any of this runs. This is the running commentary on an event already under
 * way: when reference data becomes available, where it was published, and
 * whether the count is still live at all.
 *
 * Returns `null` while nothing has been read yet, and where the document does
 * not exist. Callers must not read `null` as "not live" -- only a document that
 * exists and says so means that.
 */
export function watchLiveEvent(options: {
  eventId: MaybeRefOrGetter<string | null>
  enabled: MaybeRefOrGetter<boolean>
}): { event: Ref<LiveEventDocument | null>, stop: () => void } {
  const event = ref<LiveEventDocument | null>(null)
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
    event.value = null

    const eventId = toValue(options.eventId)
    if (!import.meta.client || !toValue(options.enabled) || !eventId) return

    const mine = ++generation

    try {
      const { doc, onSnapshot } = await import('firebase/firestore')
      const { $firestore } = useNuxtApp()
      const db = ($firestore as () => import('firebase/firestore').Firestore)()
      if (mine !== generation) return

      unsubscribe = onSnapshot(doc(db, 'events', eventId), snapshot => {
        if (mine !== generation) return

        const data = snapshot.data()
        if (!data) {
          event.value = null
          return
        }

        // Parsed with the manifest's own parser, because Django writes the
        // same map to both.
        event.value = {
          is_live: Boolean(data.is_live),
          refdata_built: Boolean(data.refdata_built),
          paths: data.paths ? normaliseVersionPaths(data.paths) : null,
        }
      }, error => {
        if (mine !== generation) return
        // Not a reason to tear the page down: the results listener has its own
        // connection state, and the SDK retries on its own.
        console.warn('[elections] could not watch event document:', error.code)
      })
    } catch (error) {
      if (mine !== generation) return
      console.warn('[elections] could not watch event document:', error)
    }
  }

  watch(
    () => [toValue(options.eventId), toValue(options.enabled)],
    () => { attach() },
    { immediate: true },
  )

  onScopeDispose(() => { generation += 1; detach() })

  return { event, stop: () => { generation += 1; detach() } }
}

/**
 * Read a whole event's reference data from Firestore, once.
 *
 * The last resort, used only when neither the event document nor the manifest
 * names a reference payload on R2. Around 700 documents for a general election,
 * so this is deliberately a
 * one-shot read and never a subscription -- reference data does not change once
 * built. Voting places are excluded; they are loaded on demand from snapshots.
 */
export async function fetchFirestoreReference(
  eventId: string,
  persistent: PersistentData,
): Promise<ReferenceData | null> {
  if (!import.meta.client) return null

  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore')
    const { $firestore } = useNuxtApp()
    const db = ($firestore as () => import('firebase/firestore').Firestore)()

    const forEvent = (name: string) =>
      getDocs(query(collection(db, name), where('event_id', '==', eventId)))

    const [electorates, parties, candidates] = await Promise.all([
      forEvent('election_electorates'),
      forEvent('election_parties'),
      forEvent('election_candidates'),
    ])

    const documents = {
      electorates: electorates.docs.map(d => d.data()),
      parties: parties.docs.map(d => d.data()),
      candidates: candidates.docs.map(d => d.data()),
    }

    if (!documents.candidates.length && !documents.parties.length) return null

    // Firestore refers to persistent entities by ObjectId and legacy id, so they
    // have to be translated back to the Django ids the contract uses.
    return normaliseFirestoreReferenceData(documents, buildPersistentIndex(persistent))
  } catch (error) {
    console.warn('[elections] could not read reference data from Firestore:', error)
    return null
  }
}
