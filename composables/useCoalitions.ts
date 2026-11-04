import type { Coalition } from '~/utils/elections/coalitions'
import { sanitiseCoalitions } from '~/utils/elections/coalitions'

/**
 * The coalitions a reader has built for one election.
 *
 * Kept on the device, per election: a reader's guess at who might govern
 * together is theirs, and it belongs to an election rather than to the
 * preliminary or official count of it, so it carries from one to the other.
 *
 * Read from storage after mount, as `useMmpSettings` does, so the first paint
 * matches the server's and the saved rows appear a moment later. Every storage
 * call is wrapped, because it throws in a private window or with site data
 * blocked, and losing a reader's coalitions is better than breaking the page.
 */
export function useCoalitions(electionSlug: MaybeRefOrGetter<string>) {
  const key = computed(() => `wts.elections.coalitions.${toValue(electionSlug)}`)
  const custom = useState<Coalition[]>(key.value, () => [])
  const hydrated = useState<boolean>(`${key.value}-hydrated`, () => false)

  onMounted(() => {
    if (hydrated.value) return
    hydrated.value = true
    try {
      const stored = window.localStorage.getItem(key.value)
      if (stored) custom.value = sanitiseCoalitions(JSON.parse(stored))
    }
    catch {
      // Storage unavailable or corrupted: start with none.
    }
  })

  // Only after hydration, so the read above is never overwritten by the empty
  // list it is about to replace.
  watch(custom, value => {
    if (!import.meta.client || !hydrated.value) return
    try {
      window.localStorage.setItem(key.value, JSON.stringify(value))
    }
    catch { /* as above */ }
  }, { deep: true })

  function add() {
    custom.value.push({ id: crypto.randomUUID(), parties: [] })
  }

  function remove(id: string) {
    custom.value = custom.value.filter(coalition => coalition.id !== id)
  }

  function addParty(id: string, party: string) {
    const coalition = custom.value.find(entry => entry.id === id)
    if (coalition && !coalition.parties.includes(party)) coalition.parties.push(party)
  }

  function removeParty(id: string, party: string) {
    const coalition = custom.value.find(entry => entry.id === id)
    if (coalition) coalition.parties = coalition.parties.filter(key => key !== party)
  }

  return { custom, add, remove, addParty, removeParty }
}
