/**
 * Normalise live Firestore documents into the canonical contract.
 *
 * These documents come from the results worker, which reads the Electoral
 * Commission's XML feed. Their shape predates this client and is not going to
 * change mid-event, so the adapting happens here rather than anywhere downstream.
 *
 * Every coercion below is against real production documents, not the example
 * files. The awkward ones:
 *
 *   - `party_id` is the string "5" in a national document and the number 5 in
 *     an electorate document, within the same event.
 *   - `updated` reads "2023-11-10T00:00:00+1300" -- the offset has no colon, so
 *     it is not valid ISO 8601 and parsing it is not portable.
 *   - `per_cent` is null on electorate documents, so shares must be computed
 *     from counts.
 *   - There is no `result_number`; that field only exists in the API.
 */

import type {
  PersistentData,
  PersistentId,
  ReferenceCandidate,
  ReferenceData,
  ReferenceElectorate,
  ReferenceParty,
  Result,
  ResultsSet,
} from '~/types/elections'
import { resultsSetKey } from './keys'
import { normaliseStatistics } from './normaliseSnapshot'
import { toBool, toEpochSeconds, toFloat, toInt, toIsoString, toStringOrNull } from './coerce'

type Raw = Record<string, unknown>

function normaliseResult(raw: Raw): Result {
  return {
    candidate: toInt(raw.candidate_id),
    party: toInt(raw.party_id),
    count: toInt(raw.count),
    per_cent: toFloat(raw.per_cent),
    list_seats: toInt(raw.list_seats),
    electorate_seats: toInt(raw.electorate_seats),
    total_seats: toInt(raw.total_seats),
  }
}

/**
 * One results document.
 *
 * `documentId` is kept only for diagnostics. It is a Mongo ObjectId inherited
 * from an earlier implementation and means nothing to this client -- results
 * are identified by what they are, via the canonical key.
 */
export function normaliseFirestoreResultsSet(documentId: string, raw: Raw): ResultsSet {
  const updated = toIsoString(raw.updated)
  const level = String(raw.results_level) as ResultsSet['results_level']
  const category = String(raw.results_category) as ResultsSet['results_category']
  const electorate = toInt(raw.electorate_id)
  // Voting place documents carry the id under either name.
  const votingPlace = toInt(raw.voting_place_id ?? raw.voting_place_no)

  return {
    key: resultsSetKey({
      results_level: level,
      results_category: category,
      electorate,
      voting_place: votingPlace,
      result_number: null,
    }),
    results_level: level,
    results_category: category,
    results_type: (toStringOrNull(raw.results_type) ?? 'actual') as ResultsSet['results_type'],
    electorate,
    voting_place: votingPlace,
    voting_place_electorate: toInt(raw.voting_place_location_electorate_id),
    result_number: null,
    informals: toInt(raw.informals),
    unknowns: toInt(raw.unknowns),
    refused: toInt(raw.refused),
    sample_size: toInt(raw.sample_size),
    is_final: toBool(raw.is_final),
    updated,
    updated_timestamp: toEpochSeconds(raw.updated_timestamp, updated),
    parsed: toIsoString(raw.parsed),
    received: toIsoString(raw.received),
    statistics: normaliseStatistics(raw.statistics),
    results: Array.isArray(raw.results) ? (raw.results as Raw[]).map(normaliseResult) : [],
    transport: 'firestore',
    source_id: documentId,
  }
}

/* -------------------------------------------------------------------------
 * Reference data
 *
 * Only read from Firestore when R2 has nothing to offer -- see
 * useElectionSource. Reference data is static once the worker has built it, so
 * the published snapshot is the right source in every normal case; this exists
 * for the window between the worker building it and Django republishing.
 * ---------------------------------------------------------------------- */

/**
 * Resolves the persistent entities a Firestore reference document points at.
 *
 * Firestore is moving to the Django UUID as the id for these entities, so that
 * there is one identity space rather than two. Until that has propagated
 * everywhere, a reference document may still carry what the previous
 * implementation used: a Mongo ObjectId for parties, candidates and voting
 * places, and for electorates the integer this site knows as `legacy_id`.
 *
 * Every index below therefore accepts both forms, and keys on strings so that
 * one lookup covers them. That is what makes the migration orderless: whether
 * the published persistent data or the Firestore reference data is updated
 * first, links keep resolving.
 */
export interface PersistentIndex {
  partyIdByFirebaseId: Map<string, PersistentId>
  candidateIdByFirebaseId: Map<string, PersistentId>
  electorateIdByLegacyId: Map<string, PersistentId>
}

export function buildPersistentIndex(persistent: PersistentData): PersistentIndex {
  const partyIdByFirebaseId = new Map<string, PersistentId>()
  for (const party of persistent.persistent_parties) {
    if (party.firebase_id) partyIdByFirebaseId.set(party.firebase_id, party.id)
    partyIdByFirebaseId.set(party.id, party.id)
  }

  const candidateIdByFirebaseId = new Map<string, PersistentId>()
  for (const candidate of persistent.persistent_candidates) {
    if (candidate.firebase_id) candidateIdByFirebaseId.set(candidate.firebase_id, candidate.id)
    candidateIdByFirebaseId.set(candidate.id, candidate.id)
  }

  const electorateIdByLegacyId = new Map<string, PersistentId>()
  for (const electorate of persistent.persistent_electorates) {
    if (electorate.legacy_id !== null) {
      electorateIdByLegacyId.set(String(electorate.legacy_id), electorate.id)
    }
    electorateIdByLegacyId.set(electorate.id, electorate.id)
  }

  return { partyIdByFirebaseId, candidateIdByFirebaseId, electorateIdByLegacyId }
}

/** Look up an id that may be either the Django UUID or a legacy Firestore one. */
function resolvePersistent(
  value: unknown, index: Map<string, PersistentId>,
): PersistentId | null {
  if (value === null || value === undefined || value === '') return null
  return index.get(String(value)) ?? null
}

export function normaliseFirestoreElectorate(
  raw: Raw, index: PersistentIndex,
): ReferenceElectorate {
  return {
    number: toInt(raw.electorate_id) ?? 0,
    name: String(raw.name ?? ''),
    // Firestore does not carry this. A cancelled candidate election is rare and
    // curated in Django, so assume the ordinary case.
    accepting_candidate_votes: toBool(raw.accepting_candidate_votes, true),
    persistent_electorate: resolvePersistent(
      raw.persistent_electorate_id, index.electorateIdByLegacyId),
  }
}

export function normaliseFirestoreParty(raw: Raw, index: PersistentIndex): ReferenceParty {
  return {
    number: toInt(raw.party_id) ?? 0,
    name: String(raw.name ?? ''),
    short_name: toStringOrNull(raw.short_name),
    abbreviation: toStringOrNull(raw.abbreviation),
    registered: toBool(raw.registered),
    persistent_party: resolvePersistent(raw.persistent_party_id, index.partyIdByFirebaseId),
  }
}

export function normaliseFirestoreCandidate(
  raw: Raw, index: PersistentIndex,
): ReferenceCandidate {
  return {
    number: toInt(raw.candidate_id) ?? 0,
    name: String(raw.name ?? ''),
    electorate: toInt(raw.electorate_id),
    party: toInt(raw.party_id),
    list_pos: toInt(raw.list_pos),
    is_dead: toBool(raw.is_dead),
    persistent_candidate: resolvePersistent(
      raw.persistent_candidate_id, index.candidateIdByFirebaseId),
  }
}

export function normaliseFirestoreReferenceData(
  documents: { electorates: Raw[], parties: Raw[], candidates: Raw[] },
  index: PersistentIndex,
): ReferenceData {
  return {
    electorates: documents.electorates.map(raw => normaliseFirestoreElectorate(raw, index)),
    parties: documents.parties.map(raw => normaliseFirestoreParty(raw, index)),
    candidates: documents.candidates.map(raw => normaliseFirestoreCandidate(raw, index)),
    // Voting places are loaded on demand and never come from this path.
    voting_places: [],
  }
}
