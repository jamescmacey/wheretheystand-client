import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import type { AppliedScenario, WhatIfLookup, WhatIfScenario } from '~/utils/elections/whatIf'
import { useElectionDataStore } from '~/stores/electionData'
import { useSeatAllocation } from '~/composables/useSeatAllocation'
import { partyKey } from '~/utils/elections/coalitions'
import { allocateSeats } from '~/utils/elections/mmp'
import {
  applyScenario,
  defaultLaw,
  defaultScenario,
  defaultSpecials,
  isScenarioEmpty,
  rulesFor,
  sanitiseScenario,
} from '~/utils/elections/whatIf'

/**
 * A reader's scenario for one election, kept on the device.
 *
 * Per election rather than per results version, as coalitions are, so a scenario
 * carries from the preliminary count to the official one.
 *
 * Read from storage after mount, as the coalitions are, so the first paint
 * matches the server's. Every storage call is wrapped, because it throws in a
 * private window or with site data blocked.
 *
 * This state is for the What if? page and nothing else. A scenario is not a
 * result, so no other page may read it: test/elections/whatIfIsolation.test.ts
 * fails if one starts to.
 */
export function useWhatIfScenario(electionSlug: MaybeRefOrGetter<string>) {
  const key = computed(() => `wts.elections.whatif.${toValue(electionSlug)}`)
  const scenario = useState<WhatIfScenario>(key.value, defaultScenario)
  const hydrated = useState<boolean>(`${key.value}-hydrated`, () => false)

  onMounted(() => {
    if (hydrated.value) return
    hydrated.value = true
    try {
      const stored = window.localStorage.getItem(key.value)
      if (stored) scenario.value = sanitiseScenario(JSON.parse(stored))
    }
    catch {
      // Storage unavailable or corrupted: start with no changes.
    }
  })

  // Only after hydration, so the read above is never overwritten by the defaults
  // it is about to replace.
  watch(scenario, value => {
    if (!import.meta.client || !hydrated.value) return
    try {
      window.localStorage.setItem(key.value, JSON.stringify(value))
    }
    catch { /* as above */ }
  }, { deep: true })

  /** Match the pins to the electorates chosen, keeping any candidate already set. */
  function setPinnedElectorates(electorates: string[]) {
    const held = new Map(scenario.value.pins.map(pin => [pin.electorate, pin.candidate]))
    scenario.value.pins = electorates.map(electorate => ({
      electorate,
      candidate: held.get(electorate) ?? null,
    }))
  }

  function setPinnedCandidate(electorate: string, candidate: string | null) {
    const pin = scenario.value.pins.find(entry => entry.electorate === electorate)
    if (pin) pin.candidate = candidate
  }

  function removePins(electorates: string[]) {
    const removing = new Set(electorates)
    scenario.value.pins = scenario.value.pins.filter(pin => !removing.has(pin.electorate))
  }

  function resetPins() {
    scenario.value.pins = []
  }

  function resetSpecials() {
    scenario.value.specials = defaultSpecials()
  }

  function resetLaw() {
    scenario.value.law = defaultLaw()
  }

  function resetAll() {
    scenario.value = defaultScenario()
  }

  const isEmpty = computed(() => isScenarioEmpty(scenario.value))

  return {
    scenario,
    isEmpty,
    setPinnedElectorates,
    setPinnedCandidate,
    removePins,
    resetPins,
    resetSpecials,
    resetLaw,
    resetAll,
  }
}

/**
 * The Parliament the reader's scenario produces.
 *
 * Takes the real allocation input and never its allocation, so it is unaffected
 * by the rules on the Settings page, and affects nothing itself: the result goes
 * back to the page that asked for it, and no further. It is not written to the
 * store. Components show it because the page passes it to them as a prop.
 *
 * Recomputes when a tally lands, so a scenario moves with a live count.
 */
export function useWhatIfAllocation(
  election: MaybeRefOrGetter<ElectionSummary>,
  resultsVersion: MaybeRefOrGetter<ResultsVersion>,
) {
  const store = useElectionDataStore()
  const { input } = useSeatAllocation(election, resultsVersion)
  const { scenario } = useWhatIfScenario(() => toValue(election).slug)

  const lookup = computed<WhatIfLookup>(() => {
    const reference = store.referenceData(toValue(election).slug, toValue(resultsVersion).slug)
    const lookup: WhatIfLookup = { partyKeys: new Map(), electorates: new Map(), candidates: new Map() }

    for (const party of reference?.parties ?? []) {
      lookup.partyKeys.set(party.number, partyKey(party.number, party.persistent_party))
    }

    // A cancelled candidate election returns no member, so it has no result to
    // pin, and its candidates are not standing anywhere that can be pinned.
    const open = new Set<number>()
    for (const electorate of reference?.electorates ?? []) {
      if (!electorate.accepting_candidate_votes) continue
      open.add(electorate.number)
      lookup.electorates.set(
        partyKey(electorate.number, electorate.persistent_electorate), electorate.number)
    }

    for (const candidate of reference?.candidates ?? []) {
      if (candidate.electorate === null || candidate.is_dead || !open.has(candidate.electorate)) continue
      lookup.candidates.set(partyKey(candidate.number, candidate.persistent_candidate), {
        candidate: candidate.number,
        party: candidate.party,
        electorate: candidate.electorate,
      })
    }

    return lookup
  })

  const applied = computed<AppliedScenario | null>(() =>
    (input.value ? applyScenario(input.value, scenario.value, lookup.value) : null))

  const allocation = computed<SeatAllocation | null>(() =>
    (applied.value ? allocateSeats(applied.value.input, rulesFor(scenario.value.law)) : null))

  return { allocation, applied, lookup, realInput: input }
}
