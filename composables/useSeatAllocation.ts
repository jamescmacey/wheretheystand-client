import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { AllocationInput, ElectorateWinInput, SeatAllocation } from '~/utils/elections/mmp'
import { allocateSeats } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { useMmpSettings } from '~/composables/useMmpSettings'

/**
 * The Parliament this results version produces, under the reader's rules.
 *
 * Everything that shows a seat number reads this, so the home page and the
 * Parliament page cannot disagree. The Electoral Commission's own seat figures are
 * still carried on each result, but they are shown only in the Parliament workings,
 * as a comparison -- once the reader can change the threshold or the formula,
 * a page mixing the two would be stating two different Parliaments at once.
 *
 * Recomputes whenever a tally lands. That is the point: on election night the
 * allocation is supposed to move.
 */
export function useSeatAllocation(
  election: MaybeRefOrGetter<ElectionSummary>,
  resultsVersion: MaybeRefOrGetter<ResultsVersion>,
) {
  const store = useElectionDataStore()
  const { settings } = useMmpSettings()

  const slugs = computed(() => ({
    election: toValue(election).slug,
    version: toValue(resultsVersion).slug,
  }))

  const nationalPartyVote = computed(() =>
    store.nationalResults(slugs.value.election, slugs.value.version, 'party_votes'))

  const reference = computed(() =>
    store.referenceData(slugs.value.election, slugs.value.version))

  /** False in a by-election, where there is no party vote to allocate on. */
  const canAllocate = computed(() =>
    Boolean(nationalPartyVote.value && reference.value?.parties.length))

  const input = computed<AllocationInput | null>(() => {
    if (!canAllocate.value) return null
    const { election: e, version: v } = slugs.value

    const partyVotes = (nationalPartyVote.value?.results ?? [])
      .filter(result => result.party !== null)
      .map(result => ({ party: result.party!, votes: result.count ?? 0 }))

    const computed_ = store.computedElectorateResults(e, v)
    const electorateWins: ElectorateWinInput[] = []

    for (const electorate of reference.value?.electorates ?? []) {
      // An electorate whose candidate election was cancelled returns no member
      // at this election, so it is not a seat to be won. Its results document
      // still exists with every candidate on zero, and treating that as a
      // contest would invent a seat -- or, before the store distinguished them,
      // a nine-way tie.
      if (!electorate.accepting_candidate_votes) continue

      const result = computed_.get(electorate.number)
      if (!result) continue

      if (result.resultStatus === 'indeterminate') {
        electorateWins.push({
          electorate: electorate.number,
          candidate: null,
          party: null,
          tie: true,
        })
        continue
      }

      // Not counted yet, or no candidates at all. Nobody has won it, and unlike
      // a tie there is nothing undecided to report -- the count simply has not
      // reached it.
      const winner = result.firstPlace?.length === 1 ? result.firstPlace[0]! : null
      if (winner === null) continue

      electorateWins.push({
        electorate: electorate.number,
        candidate: winner,
        party: store.candidate(e, v, winner)?.party ?? null,
      })
    }

    const listCandidates = (reference.value?.candidates ?? [])
      .filter(candidate => candidate.list_pos !== null && candidate.party !== null)
      .map(candidate => ({
        candidate: candidate.number,
        party: candidate.party!,
        listPos: candidate.list_pos!,
        isDead: candidate.is_dead,
      }))

    return { partyVotes, electorateWins, listCandidates }
  })

  const allocation = computed<SeatAllocation | null>(() =>
    (input.value ? allocateSeats(input.value, settings.value) : null))

  return { allocation, canAllocate, settings }
}
