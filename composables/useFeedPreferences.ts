import type { EntityNumber, FeedMessage } from '~/types/elections'
import { isVisibleFeedMessage, normaliseFeedElectorates } from '~/utils/elections/feedFilter'

const STORAGE_KEY = 'elections-feed-voting-places'
const ELECTORATES_STORAGE_KEY = 'elections-feed-voting-place-electorates'

/**
 * Whether the feed shows voting places reporting, and for which electorates.
 *
 * Off by default: on election night there are thousands of them, and they
 * bury the lead changes and seat moves most readers are watching for. The
 * choice is the reader's and is kept in local storage, so it survives a
 * reload without needing anything from the server.
 *
 * Held in `useState` so the panel, the drawer, the drawer's unread count and
 * the feed listener all read one value. The listener is what matters: it
 * leaves voting places out of the Firestore query, so the reader still gets
 * twenty entries rather than twenty with the voting places then removed. Storage is read once and wrapped, because
 * it throws in a private window or with site data blocked, and a feed that
 * fails to render over a preference would be the wrong way round.
 *
 * Electorates are held per event, because an electorate's number means nothing
 * outside the event it belongs to: number 5 this year may be somewhere else
 * entirely next time.
 */
export function useFeedVotingPlaces() {
  const show = useState(STORAGE_KEY, () => false)
  const electoratesByEvent = useState<Record<string, EntityNumber[]>>(
    ELECTORATES_STORAGE_KEY, () => ({}))
  const loaded = useState(`${STORAGE_KEY}-loaded`, () => false)

  // On mount rather than in setup, so hydration matches the server's render
  // before the stored choice is applied.
  onMounted(() => {
    if (loaded.value) return
    loaded.value = true
    try {
      show.value = localStorage.getItem(STORAGE_KEY) === 'true'
      const stored: unknown = JSON.parse(localStorage.getItem(ELECTORATES_STORAGE_KEY) ?? '{}')
      if (stored && typeof stored === 'object') {
        electoratesByEvent.value = Object.fromEntries(Object.entries(stored)
          .map(([eventId, electorates]) => [eventId, normaliseFeedElectorates(electorates)]))
      }
    } catch {
      // Storage unavailable or unreadable: the defaults stand.
    }
  })

  function setShow(value: boolean) {
    show.value = value
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Storage unavailable: the choice lasts until the page is closed.
    }
  }

  /** The electorates chosen for an event. Empty means all of them. */
  function electoratesFor(eventId: string | null | undefined): EntityNumber[] {
    return eventId ? electoratesByEvent.value[eventId] ?? [] : []
  }

  function setElectorates(eventId: string, electorates: EntityNumber[]) {
    electoratesByEvent.value = {
      ...electoratesByEvent.value,
      [eventId]: normaliseFeedElectorates(electorates),
    }
    try {
      localStorage.setItem(ELECTORATES_STORAGE_KEY, JSON.stringify(electoratesByEvent.value))
    } catch {
      // Storage unavailable: the choice lasts until the page is closed.
    }
  }

  /** The entries to show, leaving out any voting places not asked for. */
  function visible(messages: FeedMessage[]) {
    return messages.filter(message => isVisibleFeedMessage(
      message, show.value, electoratesFor(message.event_id)))
  }

  return { show, setShow, electoratesFor, setElectorates, visible }
}
