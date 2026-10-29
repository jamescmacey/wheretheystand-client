import { defineStore } from 'pinia'

import type {
  ComputedElectorateResult,
  ElectorateLeader,
  ElectorateResultStatus,
  EntityNumber,
  PersistentCandidate,
  PersistentData,
  PersistentElectorate,
  PersistentId,
  PersistentParty,
  ReferenceCandidate,
  ReferenceData,
  ReferenceElectorate,
  ReferenceParty,
  ReferenceVotingPlace,
  Result,
  ResultsCategory,
  ResultsSet,
  ResultsSummary,
  SummaryCandidate,
  SummaryElectorate,
} from '~/types/elections'
import { electionKey, indexBy, isNewerResultsSet } from '~/utils/elections/keys'

/**
 * Everything the results dashboard renders, for every results version visited.
 *
 * Results arrive from published snapshots and, during an event, from Firestore
 * over the top. Both normalise to the same shape and are keyed the same way, so
 * this store does not know or care which transport supplied a tally.
 *
 * Reference entities are indexed by their Electoral Commission number when they
 * are stored. The pages render hundreds of rows, each needing a party, a
 * candidate and a colour, so scanning arrays per row per render is quadratic
 * work on every frame.
 */

interface VersionState {
  reference: ReferenceData | null
  /** Results sets by canonical key. */
  results: Map<string, ResultsSet>
  /** Derived per-electorate outcomes, by electorate number. */
  electorateResults: Map<EntityNumber, ComputedElectorateResult>
  /** Electorate numbers whose voting place results have been loaded. */
  votingPlacesLoaded: Set<EntityNumber>
  /**
   * Voting place numbers whose own file has been fetched.
   *
   * A different question from `votingPlacesLoaded`, which answers "has this
   * electorate's shard landed". One place's file covers every electorate it
   * served, so neither implies the other.
   */
  placeResultsLoaded: Set<EntityNumber>
  /** Sequence of the last summary applied, for rejecting stale ones. */
  summarySequence: number | null
  /**
   * How current the applied summary said it was.
   *
   * A summary populates derived electorate outcomes but no results sets, so a
   * surface fed only by one cannot date itself from the tallies the way the
   * dashboard does.
   */
  summaryUpdatedTimestamp: number | null
  electoratesByNumber: Map<EntityNumber, ReferenceElectorate>
  partiesByNumber: Map<EntityNumber, ReferenceParty>
  candidatesByNumber: Map<EntityNumber, ReferenceCandidate>
  votingPlacesByNumber: Map<EntityNumber, ReferenceVotingPlace>
}

interface ElectionDataState {
  persistent: PersistentData | null
  persistentPartiesById: Map<string, PersistentParty>
  persistentCandidatesById: Map<string, PersistentCandidate>
  persistentElectoratesById: Map<string, PersistentElectorate>
  versions: Record<string, VersionState>
}

/** The colour shown for a party with none recorded. */
export const DEFAULT_PARTY_COLOUR = '#9ca3af'

/**
 * The lead in points, preferring the shares the summary already carries.
 *
 * Those shares were computed from the same counts, so using them keeps the
 * margin and the two percentages consistent on screen. The fallback is for a
 * document written before `per_cent` was populated.
 */
function marginPercentage(entry: SummaryElectorate): number | null {
  const leader = entry.leader
  if (!leader) return null

  const runnerUp = entry.runner_up
  if (leader.per_cent !== null && runnerUp?.per_cent != null) {
    return Math.round((leader.per_cent - runnerUp.per_cent) * 100) / 100
  }

  if (!entry.total_votes_cast) return null
  const margin = leader.count - (runnerUp?.count ?? 0)
  return Math.round(margin / entry.total_votes_cast * 10000) / 100
}

function emptyVersion(): VersionState {
  return {
    reference: null,
    results: new Map(),
    electorateResults: new Map(),
    votingPlacesLoaded: new Set(),
    placeResultsLoaded: new Set(),
    summarySequence: null,
    summaryUpdatedTimestamp: null,
    electoratesByNumber: new Map(),
    partiesByNumber: new Map(),
    candidatesByNumber: new Map(),
    votingPlacesByNumber: new Map(),
  }
}

/**
 * Work out who won an electorate, and by how much.
 *
 * Ties matter here: an electorate can be genuinely undecided on the night, and
 * showing a single leader when two candidates are level would be wrong rather
 * than merely imprecise.
 */
export function computeElectorateResult(set: ResultsSet): ComputedElectorateResult | null {
  if (set.electorate === null) return null

  const results = [...set.results].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

  /** The top of the sorted tally, for a caller that wants to print it. */
  const topTwo = (): ElectorateLeader[] => results
    .filter((result): result is Result & { candidate: EntityNumber } => result.candidate !== null)
    .slice(0, 2)
    .map(result => ({ candidate: result.candidate, count: result.count ?? 0 }))

  if (results.length === 0) {
    return {
      electorate: set.electorate,
      resultStatus: 'no_candidates',
      firstPlace: null,
      secondPlace: null,
      margin: null,
      marginPercentage: null,
      leaders: [],
    }
  }

  if (results.length === 1) {
    // One candidate, so the seat is taken without a contest.
    return {
      electorate: set.electorate,
      resultStatus: 'defaulted',
      firstPlace: results[0]!.candidate === null ? null : [results[0]!.candidate],
      secondPlace: null,
      margin: null,
      marginPercentage: null,
      leaders: topTwo(),
    }
  }

  const totalVotes = results.reduce((sum, result) => sum + (result.count ?? 0), 0)
  const firstCount = results[0]!.count ?? 0

  // Nothing counted yet. Every candidate is level on zero, which is not a tie:
  // reading it as one would put every electorate in the country at "too close
  // to call" the moment polls close, and would do the same permanently to an
  // electorate whose candidate election was cancelled.
  if (firstCount === 0 && totalVotes === 0) {
    return {
      electorate: set.electorate,
      resultStatus: 'uncounted',
      firstPlace: null,
      secondPlace: null,
      margin: null,
      marginPercentage: null,
      // Nothing counted is nothing to show: two names on nothing would read as
      // a contest that has started.
      leaders: [],
    }
  }

  const firstPlace = results
    .filter(result => (result.count ?? 0) === firstCount)
    .map(result => result.candidate)
    .filter((candidate): candidate is EntityNumber => candidate !== null)

  const secondCount = results.find(result => (result.count ?? 0) < firstCount)?.count ?? null
  const secondPlace = secondCount === null
    ? null
    : results
        .filter(result => (result.count ?? 0) === secondCount)
        .map(result => result.candidate)
        .filter((candidate): candidate is EntityNumber => candidate !== null)

  const share = (count: number) => (totalVotes > 0 ? (count / totalVotes) * 100 : 0)
  const tied = firstPlace.length > 1

  return {
    electorate: set.electorate,
    resultStatus: tied ? 'indeterminate' : 'determined',
    firstPlace: firstPlace.length ? firstPlace : null,
    secondPlace: secondPlace && secondPlace.length ? secondPlace : null,
    margin: tied ? 0 : firstCount - (secondCount ?? 0),
    marginPercentage: tied ? 0 : share(firstCount) - share(secondCount ?? 0),
    leaders: topTwo(),
  }
}

export const useElectionDataStore = defineStore('electionData', {
  state: (): ElectionDataState => ({
    persistent: null,
    persistentPartiesById: new Map(),
    persistentCandidatesById: new Map(),
    persistentElectoratesById: new Map(),
    versions: {},
  }),

  getters: {
    isPersistentLoaded: state => state.persistent !== null,

    hasReference: state => (election: string, version: string) =>
      Boolean(state.versions[electionKey(election, version)]?.reference),

    /** How current an applied summary said it was, for an "as at" line. */
    summaryUpdatedTimestamp: state => (election: string, version: string) =>
      state.versions[electionKey(election, version)]?.summaryUpdatedTimestamp ?? null,

    hasResults: state => (election: string, version: string) =>
      (state.versions[electionKey(election, version)]?.results.size ?? 0) > 0,

    hasVotingPlaceResults: state => (election: string, version: string, electorate: EntityNumber) =>
      Boolean(state.versions[electionKey(election, version)]?.votingPlacesLoaded.has(electorate)),

    hasPlaceResults: state => (election: string, version: string, votingPlace: EntityNumber) =>
      Boolean(state.versions[electionKey(election, version)]?.placeResultsLoaded.has(votingPlace)),

    referenceData: state => (election: string, version: string) =>
      state.versions[electionKey(election, version)]?.reference ?? null,

    /** Every results set held for a version, in no particular order. */
    allResults: state => (election: string, version: string): ResultsSet[] =>
      [...(state.versions[electionKey(election, version)]?.results.values() ?? [])],

    nationalResults: state => (election: string, version: string, category: ResultsCategory) => {
      const held = state.versions[electionKey(election, version)]?.results
      if (!held) return null
      for (const set of held.values()) {
        if (set.results_level === 'national' && set.results_category === category) return set
      }
      return null
    },

    electorateResults: state =>
      (election: string, version: string, electorate: EntityNumber, category: ResultsCategory) => {
        const held = state.versions[electionKey(election, version)]?.results
        if (!held) return null
        for (const set of held.values()) {
          if (set.results_level === 'electorate'
            && set.results_category === category
            && set.electorate === electorate) return set
        }
        return null
      },

    votingPlaceResults: state =>
      (election: string, version: string, electorate: EntityNumber, category: ResultsCategory) => {
        const held = state.versions[electionKey(election, version)]?.results
        if (!held) return []
        return [...held.values()].filter(set =>
          set.results_level === 'voting_place'
          && set.results_category === category
          && set.electorate === electorate)
      },

    /**
     * Every tally counted at one voting place, across every electorate it
     * issued votes for.
     *
     * A list rather than one set per category, and not reducible to one: a
     * place serves several electorates, and may report more than once for the
     * same electorate and category. Callers aggregate.
     */
    resultsForVotingPlace: state =>
      (election: string, version: string, votingPlace: EntityNumber): ResultsSet[] => {
        const held = state.versions[electionKey(election, version)]?.results
        if (!held) return []
        return [...held.values()].filter(set =>
          set.results_level === 'voting_place'
          && set.voting_place === votingPlace)
      },

    computedElectorateResults: state => (election: string, version: string) =>
      state.versions[electionKey(election, version)]?.electorateResults ?? new Map(),

    computedElectorateResult: state =>
      (election: string, version: string, electorate: EntityNumber) =>
        state.versions[electionKey(election, version)]?.electorateResults.get(electorate) ?? null,

    electorate: state => (election: string, version: string, number: EntityNumber) =>
      state.versions[electionKey(election, version)]?.electoratesByNumber.get(number) ?? null,

    party: state => (election: string, version: string, number: EntityNumber) =>
      state.versions[electionKey(election, version)]?.partiesByNumber.get(number) ?? null,

    candidate: state => (election: string, version: string, number: EntityNumber) =>
      state.versions[electionKey(election, version)]?.candidatesByNumber.get(number) ?? null,

    votingPlace: state => (election: string, version: string, number: EntityNumber) =>
      state.versions[electionKey(election, version)]?.votingPlacesByNumber.get(number) ?? null,

    /**
     * A party by its own persistent id.
     *
     * Incumbency and the bloc order are both curated against persistent ids
     * rather than an election's party numbers, so naming one of them needs no
     * election to look it up in.
     */
    persistentParty: state => (id: PersistentId) =>
      state.persistentPartiesById.get(id) ?? null,

    /** The cross-election party record behind a party at one election. */
    persistentPartyForParty: state =>
      (election: string, version: string, number: EntityNumber) => {
        const party = state.versions[electionKey(election, version)]?.partiesByNumber.get(number)
        if (!party?.persistent_party) return null
        return state.persistentPartiesById.get(party.persistent_party) ?? null
      },

    persistentPartyForCandidate: state =>
      (election: string, version: string, number: EntityNumber) => {
        const held = state.versions[electionKey(election, version)]
        const candidate = held?.candidatesByNumber.get(number)
        if (!candidate?.party) return null
        const party = held?.partiesByNumber.get(candidate.party)
        if (!party?.persistent_party) return null
        return state.persistentPartiesById.get(party.persistent_party) ?? null
      },

    persistentCandidateFor: state =>
      (election: string, version: string, number: EntityNumber) => {
        const candidate = state.versions[electionKey(election, version)]
          ?.candidatesByNumber.get(number)
        if (!candidate?.persistent_candidate) return null
        return state.persistentCandidatesById.get(candidate.persistent_candidate) ?? null
      },

    persistentElectorateFor: state =>
      (election: string, version: string, number: EntityNumber) => {
        const electorate = state.versions[electionKey(election, version)]
          ?.electoratesByNumber.get(number)
        if (!electorate?.persistent_electorate) return null
        return state.persistentElectoratesById.get(electorate.persistent_electorate) ?? null
      },

    /** One place deciding a party's colour, rather than a different fallback per page. */
    partyColour: state => (election: string, version: string, number: EntityNumber | null) => {
      if (number === null) return DEFAULT_PARTY_COLOUR
      const party = state.versions[electionKey(election, version)]?.partiesByNumber.get(number)
      if (!party?.persistent_party) return DEFAULT_PARTY_COLOUR
      return state.persistentPartiesById.get(party.persistent_party)?.colour
        ?? DEFAULT_PARTY_COLOUR
    },
  },

  actions: {
    ensureVersion(election: string, version: string): VersionState {
      const key = electionKey(election, version)
      if (!this.versions[key]) this.versions[key] = emptyVersion()
      return this.versions[key]!
    },

    setPersistentData(data: PersistentData) {
      this.persistent = data
      this.persistentPartiesById = indexBy(data.persistent_parties, party => party.id)
      this.persistentCandidatesById = indexBy(data.persistent_candidates, c => c.id)
      this.persistentElectoratesById = indexBy(data.persistent_electorates, e => e.id)
    },

    setReferenceData(election: string, version: string, data: ReferenceData) {
      const held = this.ensureVersion(election, version)
      held.reference = data
      held.electoratesByNumber = indexBy(data.electorates, item => item.number)
      held.partiesByNumber = indexBy(data.parties, item => item.number)
      held.candidatesByNumber = indexBy(data.candidates, item => item.number)
      if (data.voting_places.length) {
        held.votingPlacesByNumber = indexBy(data.voting_places, item => item.number)
      }
    },

    setVotingPlaceReference(election: string, version: string, places: ReferenceVotingPlace[]) {
      const held = this.ensureVersion(election, version)
      held.votingPlacesByNumber = indexBy(places, item => item.number)
      if (held.reference) held.reference.voting_places = places
    },

    /**
     * Merge results in, keeping whichever tally is newer.
     *
     * Called for the initial snapshot and for every live update. A snapshot
     * fetch can land after a live update has already arrived, and Firestore can
     * deliver out of order, so arrival order is not recency order.
     *
     * Returns the number of sets actually applied, which lets callers tell a
     * no-op update from a real one.
     */
    applyResults(election: string, version: string, sets: ResultsSet[]): number {
      const held = this.ensureVersion(election, version)
      let applied = 0

      for (const set of sets) {
        if (!isNewerResultsSet(set, held.results.get(set.key))) continue

        held.results.set(set.key, set)
        applied += 1

        if (set.results_level === 'electorate' && set.results_category === 'candidate_votes') {
          const computed = computeElectorateResult(set)
          if (computed) held.electorateResults.set(computed.electorate, computed)
        }
        if (set.results_level === 'voting_place' && set.electorate !== null) {
          held.votingPlacesLoaded.add(set.electorate)
        }
      }

      return applied
    },

    markVotingPlacesLoaded(election: string, version: string, electorate: EntityNumber) {
      this.ensureVersion(election, version).votingPlacesLoaded.add(electorate)
    },

    /**
     * Record that a place's own file has been fetched, whether or not it held
     * anything.
     *
     * A place with nothing counted has no file at all, and a 404 is an answer.
     * Marking it keeps the page from refetching on every re-render.
     */
    markPlaceResultsLoaded(election: string, version: string, votingPlace: EntityNumber) {
      this.ensureVersion(election, version).placeResultsLoaded.add(votingPlace)
    },

    /**
     * Fold a summary document into the derived per-electorate outcomes.
     *
     * A summary carries each electorate's leader and margin without the full
     * tallies, which is what surfaces like a "closest races" list need. It
     * populates the same map the full results do, so anything rendering from
     * `computedElectorateResults` works either way.
     *
     * Rejected outright if it is not newer than the summary already held:
     * snapshots are delivered out of order often enough to matter.
     */
    applySummary(election: string, version: string, summary: ResultsSummary): boolean {
      const held = this.ensureVersion(election, version)

      if (summary.sequence !== null
        && held.summarySequence !== null
        && summary.sequence <= held.summarySequence) {
        return false
      }
      held.summarySequence = summary.sequence

      for (const entry of summary.electorates) {
        const leader = entry.leader
        const runnerUp = entry.runner_up

        // The summary states the three cases rather than leaving them to be
        // inferred from a zero margin: no leader at all means nothing counted,
        // and two equal counts on a real tally mean an undecided seat.
        const tied = leader !== null && runnerUp !== null && leader.count === runnerUp.count
        const status: ElectorateResultStatus = leader === null
          ? 'uncounted'
          : (tied ? 'indeterminate' : 'determined')

        held.electorateResults.set(entry.electorate, {
          electorate: entry.electorate,
          resultStatus: status,
          firstPlace: leader === null || tied ? null : [leader.candidate],
          secondPlace: runnerUp === null || tied ? null : [runnerUp.candidate],
          margin: leader === null ? null : leader.count - (runnerUp?.count ?? 0),
          // The summary names both even where they are level, which is what
          // lets a tied seat render as two candidates rather than as nothing.
          leaders: [leader, runnerUp]
            .filter((entry): entry is SummaryCandidate => entry !== null)
            .map(entry => ({ candidate: entry.candidate, count: entry.count })),
          // From the shares the summary carries, so the two agree. Falling back
          // to the counts covers a document written before they were computed.
          marginPercentage: marginPercentage(entry),
        })
      }

      held.summaryUpdatedTimestamp = summary.updated_timestamp

      return true
    },

    clearVersion(election: string, version: string) {
      delete this.versions[electionKey(election, version)]
    },

    clearAll() {
      this.persistent = null
      this.persistentPartiesById = new Map()
      this.persistentCandidatesById = new Map()
      this.persistentElectoratesById = new Map()
      this.versions = {}
    },
  },
})
