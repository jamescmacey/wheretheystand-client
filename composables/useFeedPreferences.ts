import type { FeedMessage } from '~/types/elections'

const STORAGE_KEY = 'elections-feed-voting-places'

/**
 * Whether the feed shows voting places reporting.
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
 */
export function useFeedVotingPlaces() {
  const show = useState(STORAGE_KEY, () => false)
  const loaded = useState(`${STORAGE_KEY}-loaded`, () => false)

  // On mount rather than in setup, so hydration matches the server's render
  // before the stored choice is applied.
  onMounted(() => {
    if (loaded.value) return
    loaded.value = true
    try {
      show.value = localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      // Storage unavailable: the default stands.
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

  /** The entries to show, with voting places dropped unless asked for. */
  function visible(messages: FeedMessage[]) {
    return show.value
      ? messages
      : messages.filter(message => message.type !== 'VOTING_PLACE_ADDED')
  }

  return { show, setShow, visible }
}
