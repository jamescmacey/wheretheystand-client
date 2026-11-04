import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { ResultsColumn } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import {
  candidateComparisonFigures,
  partyComparisonShare,
  type CandidateComparisonFigure,
} from '~/utils/elections/comparison'

/**
 * The election this results version is compared against, resolved for tables.
 *
 * Results here are keyed by Commission number and the comparison by persistent
 * id, so every lookup goes through the version's reference data first. Where
 * no comparison is published, or it has not loaded, everything is null and
 * tables carry no extra column.
 */
export function useComparison(
  election: MaybeRefOrGetter<ElectionSummary>,
  resultsVersion: MaybeRefOrGetter<ResultsVersion>,
) {
  const store = useElectionDataStore()
  const slugs = computed(() => ({
    e: toValue(election).slug,
    v: toValue(resultsVersion).slug,
  }))

  const comparison = computed(() => store.comparisonData(slugs.value.e, slugs.value.v))

  /** The year, which is what a reader calls an election by. */
  const label = computed(() => {
    const data = comparison.value
    if (!data) return null
    return data.election.polling_date?.slice(0, 4) || data.election.name
  })

  const column = computed<ResultsColumn | null>(() => (comparison.value && label.value
    ? {
        key: 'comparison',
        label: label.value,
        title: comparison.value.election.name,
        width: '4.5rem',
        muted: true,
      }
    : null))

  const persistentParty = (party: EntityNumber | null) =>
    (party === null ? null : store.party(slugs.value.e, slugs.value.v, party)?.persistent_party ?? null)

  const electorateEntry = (electorate: EntityNumber) => {
    const id = store.electorate(slugs.value.e, slugs.value.v, electorate)?.persistent_electorate
    return id ? comparison.value?.electorates[id] ?? null : null
  }

  /** A party's national share last time. */
  const nationalPartyShare = (party: EntityNumber | null) =>
    partyComparisonShare(comparison.value?.national.party_votes, persistentParty(party))

  /** A party's share of one electorate's party vote last time. */
  const electoratePartyShare = (electorate: EntityNumber, party: EntityNumber | null) =>
    partyComparisonShare(electorateEntry(electorate)?.party_votes, persistentParty(party))

  /** What one candidate is measured against in their electorate. */
  const candidateFigures = (
    electorate: EntityNumber,
    candidate: EntityNumber,
  ): CandidateComparisonFigure[] => {
    const held = store.candidate(slugs.value.e, slugs.value.v, candidate)
    if (!held) return []
    return candidateComparisonFigures(
      electorateEntry(electorate)?.candidate_votes,
      held.persistent_candidate,
      persistentParty(held.party),
    )
  }

  return {
    comparison,
    label,
    column,
    nationalPartyShare,
    electoratePartyShare,
    candidateFigures,
  }
}
