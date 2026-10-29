import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { Bloc } from '~/utils/elections/blocs'
import { blocFor, hasBlocs, orderByBloc, unalignedSeatIndex } from '~/utils/elections/blocs'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * Seating order for one results version, by political bloc.
 *
 * Everything that draws parties side by side reads this, so the seat bar, the
 * allocation table and the chamber cannot put them in different orders. The
 * ordering rule itself lives in `utils/elections/blocs`; this binds it to one
 * version and to the store that resolves an election party number to the
 * persistent party the blocs are curated against -- the same hop
 * `store.partyColour` makes.
 *
 * Falls back to ordering by size where no blocs are curated, which is every
 * archived election.
 */
export function useBlocOrder(
  election: MaybeRefOrGetter<ElectionSummary>,
  resultsVersion: MaybeRefOrGetter<ResultsVersion>,
) {
  const store = useElectionDataStore()

  const slugs = computed(() => ({
    election: toValue(election).slug,
    version: toValue(resultsVersion).slug,
  }))

  const blocs = computed(() => toValue(resultsVersion).blocs)
  const curated = computed(() => hasBlocs(blocs.value))

  const resolve = (party: EntityNumber) =>
    store.persistentPartyForParty(
      slugs.value.election, slugs.value.version, party)?.id ?? null

  /** `[party number, seats]` pairs, far left of the chamber to far right. */
  const order = (entries: [EntityNumber, number][]) =>
    orderByBloc(entries, blocs.value, resolve)

  /** Which bloc one election party sits in. */
  const bloc = (party: EntityNumber): Bloc => blocFor(blocs.value, resolve(party))

  /** Where seats belonging to nobody go: the middle, not an end. */
  const unalignedIndex = (ordered: [EntityNumber, number][]) =>
    unalignedSeatIndex(ordered, blocs.value, resolve)

  return { blocs, curated, order, bloc, unalignedIndex }
}
