import type {
  ElectionSummary,
  EntityNumber,
  ReferenceVotingPlace,
  ResultsVersion,
  VotingPlaceHit,
} from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import {
  useElectorateVotingPlacesScope,
  useInjectedElectionSource,
} from '~/composables/useElectionSource'

export interface ElectorateVotingPlace {
  number: EntityNumber
  address: string
  latitude: number | null
  longitude: number | null
  /**
   * Stands in another electorate and issued this one's ballots: an advance
   * voting place elsewhere, usually. Never claimed for a Māori seat, whose
   * places all stand in a general electorate by definition.
   */
  away: boolean
  /** The general electorate the place stands in, where known. */
  standsIn: EntityNumber | null
  to: string
}

/**
 * How many numbers go in one Algolia filter.
 *
 * Every chunk is one query in the same `multipleQueries` request, so this
 * bounds the filter's length, not the number of round trips.
 */
const LOOKUP_CHUNK = 100

/**
 * Every voting place that counted votes for one electorate, with where it is.
 *
 * Two steps, because neither source can answer the question alone.
 *
 * Which places: read off the tallies, not off the places' own records. A
 * place's record names the general electorate it stands in, which is no help
 * for a Māori seat and misses every advance place elsewhere that issued this
 * seat's ballots. Live, that is a Firestore subscription to the electorate's
 * voting place candidate votes; archived, the published shard.
 *
 * Where they are: resolved from Algolia, by number, in one request however
 * many places there are. Numbers already resolved, or already asked for, are
 * not asked for again, so a live update that brings one new place costs one
 * small lookup rather than the whole list again.
 *
 * Call once per page and hand the result to whatever renders it: the list and
 * the map read the same places.
 */
export function useElectorateVotingPlaces(options: {
  election: MaybeRefOrGetter<ElectionSummary>
  resultsVersion: MaybeRefOrGetter<ResultsVersion>
  electorate: MaybeRefOrGetter<EntityNumber>
}) {
  const store = useElectionDataStore()
  const source = useInjectedElectionSource()

  const slugs = computed(() => ({
    e: toValue(options.election).slug,
    v: toValue(options.resultsVersion).slug,
  }))
  const electorate = computed(() => toValue(options.electorate))

  /* ------------------------------------------------------------------ *
   * Which places
   * ------------------------------------------------------------------ */

  useElectorateVotingPlacesScope(electorate)

  // The published shard, where there is one. Returns at once where there is
  // not, which is every live version so far.
  watch(electorate, (number) => {
    if (import.meta.server) return
    source?.loadVotingPlaces(number)
  }, { immediate: true })

  const available = computed(() => Boolean(source?.votingPlaceResultsAvailable.value))

  const loaded = computed(() =>
    store.hasVotingPlaceResults(slugs.value.e, slugs.value.v, electorate.value))

  /**
   * Each place's number, with the electorate it stands in as the tally says.
   *
   * Party votes are read as well where present, so a published shard that
   * carries them contributes; the live subscription brings candidate votes
   * only, which is every place either way.
   */
  const tallied = computed(() => {
    const located = new Map<EntityNumber, EntityNumber | null>()
    for (const category of ['candidate_votes', 'party_votes'] as const) {
      for (const set of store.votingPlaceResults(
        slugs.value.e, slugs.value.v, electorate.value, category)) {
        if (set.voting_place === null) continue
        if (!located.has(set.voting_place) || located.get(set.voting_place) === null) {
          located.set(set.voting_place, set.voting_place_electorate)
        }
      }
    }
    return located
  })

  /* ------------------------------------------------------------------ *
   * Where they are
   * ------------------------------------------------------------------ */

  const indexName = useAlgoliaIndexName('ElectionVotingPlaces')

  // Per results version, and per composable instance: a number asked for and
  // not found is not asked for again on every live update.
  const requested = new Set<string>()
  const resolving = ref(0)

  function toReference(hit: VotingPlaceHit): ReferenceVotingPlace {
    return {
      number: hit.number,
      physical_electorate: hit.electorate_number ?? null,
      address: hit.address,
      latitude: hit.latitude ?? hit._geoloc?.lat ?? null,
      longitude: hit.longitude ?? hit._geoloc?.lng ?? null,
      persistent_voting_place: hit.persistent_voting_place ?? null,
      id: hit.objectID,
    }
  }

  async function resolve(numbers: EntityNumber[]) {
    const version = toValue(options.resultsVersion)
    const { e, v } = slugs.value
    if (!numbers.length) return

    for (const number of numbers) requested.add(`${version.id}:${number}`)

    const chunks: EntityNumber[][] = []
    for (let start = 0; start < numbers.length; start += LOOKUP_CHUNK) {
      chunks.push(numbers.slice(start, start + LOOKUP_CHUNK))
    }

    resolving.value += 1
    try {
      const { results } = await useNuxtApp().$algolia.multipleQueries<VotingPlaceHit>(
        chunks.map(chunk => ({
          indexName,
          query: '',
          params: {
            // Filtered, not queried: identity lookups want the record or
            // nothing, not the best text match for a number.
            filters: `results_version:"${version.id}" AND (${
              chunk.map(number => `number=${number}`).join(' OR ')})`,
            hitsPerPage: chunk.length,
            attributesToRetrieve: [
              'number', 'address', 'latitude', 'longitude', '_geoloc',
              'electorate_number', 'persistent_voting_place',
            ],
            attributesToHighlight: [],
            attributesToSnippet: [],
            analytics: false,
          },
        })),
      )

      const places = results.flatMap(result => result.hits.map(toReference))
      store.mergeVotingPlaces(e, v, places)
    } catch (caught) {
      // Forget the numbers, so the next update tries again. The list still
      // renders meanwhile, by number.
      for (const number of numbers) requested.delete(`${version.id}:${number}`)
      console.warn('[elections] could not resolve voting places:', caught)
    } finally {
      resolving.value -= 1
    }
  }

  // Coalesced: a live count delivers places a few at a time, and the first
  // snapshot can arrive in more than one batch. Throttled rather than
  // debounced -- during a busy count the tallies change more often than any
  // quiet period would allow, and a debounce would never fire.
  let pending: ReturnType<typeof setTimeout> | null = null

  watch(tallied, () => {
    if (import.meta.server || pending) return
    pending = setTimeout(() => {
      pending = null
      const version = toValue(options.resultsVersion)
      const missing = [...tallied.value.keys()].filter(number =>
        !store.votingPlace(slugs.value.e, slugs.value.v, number)
        && !requested.has(`${version.id}:${number}`))
      resolve(missing)
    }, 150)
  }, { immediate: true })

  onScopeDispose(() => { if (pending) clearTimeout(pending) })

  /* ------------------------------------------------------------------ *
   * Together
   * ------------------------------------------------------------------ */

  const isMaori = computed(() => store.persistentElectorateFor(
    slugs.value.e, slugs.value.v, electorate.value)?.electorate_type === 'maori')

  const places = computed<ElectorateVotingPlace[]>(() =>
    [...tallied.value.entries()]
      .map(([number, talliedElectorate]) => {
        const reference = store.votingPlace(slugs.value.e, slugs.value.v, number)
        // The tally's own record of where the place stands answers first; the
        // place's record fills in where the tally did not say.
        const standsIn = talliedElectorate ?? reference?.physical_electorate ?? null
        return {
          number,
          address: reference?.address ?? `Voting place ${number}`,
          latitude: reference?.latitude ?? null,
          longitude: reference?.longitude ?? null,
          away: !isMaori.value && standsIn !== null && standsIn !== electorate.value,
          standsIn,
          to: `/elections/${slugs.value.e}/${slugs.value.v}/voting-places/${number}`,
        }
      })
      // The seat's own places first, then those elsewhere that issued its
      // ballots; by address within each, the only name a place has.
      .sort((a, b) => Number(a.away) - Number(b.away)
        || a.address.localeCompare(b.address, 'en-NZ')))

  // A spinner only while the tallies are in flight: a page revisited once
  // they have landed shows the list at once, and a version without them never
  // spins at all.
  const loading = computed(() => available.value && !loaded.value && !places.value.length)

  return {
    places,
    isMaori,
    available,
    loading,
    resolving: computed(() => resolving.value > 0),
  }
}
