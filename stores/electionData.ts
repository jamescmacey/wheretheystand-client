import { defineStore } from 'pinia'

import type {
  ComputedElectorateResult,
  EntityNumber,
  PersistentCandidate,
  PersistentData,
  PersistentElectorate,
  PersistentParty,
  ReferenceCandidate,
  ReferenceData,
  ReferenceElectorate,
  ReferenceParty,
  ReferenceVotingPlace,
  ResultsCategory,
  ResultsSet,
  ResultsSummary,
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
  /** Sequence of the last summary applied, for rejecting stale ones. */
  summarySequence: number | null
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

function emptyVersion(): VersionState {
  return {
    reference: null,
    results: new Map(),
    electorateResults: new Map(),
    votingPlacesLoaded: new Set(),
    summarySequence: null,
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

  if (results.length === 0) {
    return {
      electorate: set.electorate,
      resultStatus: 'no_candidates',
      firstPlace: null,
      secondPlace: null,
      margin: null,
      marginPercentage: null,
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

    hasResults: state => (election: string, version: string) =>
      (state.versions[electionKey(election, version)]?.results.size ?? 0) > 0,

    hasVotingPlaceResults: state => (election: string, version: string, electorate: EntityNumber) =>
      Boolean(state.versions[electionKey(election, version)]?.votingPlacesLoaded.has(electorate)),

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
        const leader = entry.leader?.candidate ?? null
        const runnerUp = entry.runner_up?.candidate ?? null

        // A summary distinguishes the three cases explicitly, so this does not
        // have to infer them from a zero margin: no leader with a tie flag is
        // a genuine tie, no leader without one is simply not counted.
        const status = leader !== null
          ? 'determined'
          : (entry.tie ? 'indeterminate' : 'uncounted')

        held.electorateResults.set(entry.electorate, {
          electorate: entry.electorate,
          resultStatus: status,
          firstPlace: leader === null ? null : [leader],
          secondPlace: runnerUp === null ? null : [runnerUp],
          margin: entry.margin,
          marginPercentage: entry.margin_per_cent,
        })
      }

      if (summary.national) {
        this.applyResults(election, version, [summary.national])
      }

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
