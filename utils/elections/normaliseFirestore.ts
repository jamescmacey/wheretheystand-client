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
 *   - `result_number` has never been seen on a document. It is read anyway, in
 *     case the feed starts carrying it, and the document id discriminates
 *     voting place sets until it does -- see `resultsSetKey`.
 */

import type {
  CompositionChange,
  CompositionChangedMetadata,
  ElectorateLeadChangeMetadata,
  FeedMessage,
  FeedMessageBase,
  FeedMessageType,
  PersistentData,
  PersistentId,
  ReferenceCandidate,
  ReferenceData,
  ReferenceElectorate,
  ReferenceParty,
  Result,
  ResultsSet,
  ResultsSummary,
  ServiceAnnouncementMetadata,
  SummaryCandidate,
  SummaryElectorate,
  VotingPlaceAddedMetadata,
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
 * `documentId` is a Mongo ObjectId inherited from an earlier implementation.
 * It is diagnostic for national and electorate tallies, which the canonical
 * key identifies on its own, and load bearing for voting place ones, which it
 * cannot: a place may report twice for the same electorate and category, and
 * the document id is the only thing separating the two reports that the
 * published snapshot also carries. See `resultsSetKey`.
 */
export function normaliseFirestoreResultsSet(documentId: string, raw: Raw): ResultsSet {
  const updated = toIsoString(raw.updated)
  const level = String(raw.results_level) as ResultsSet['results_level']
  const category = String(raw.results_category) as ResultsSet['results_category']
  const electorate = toInt(raw.electorate_id)
  // Voting place documents have been seen carrying the id under either name.
  //
  // Worth distrusting: `migration/example_results.json` has a document with
  // `voting_place_id: 4206` *and* `voting_place_no: 1`, so on that document
  // they are plainly different things, and the field the model now calls
  // `result_number` was renamed from `voting_place_number`. If `voting_place_no`
  // is the report's ordinal rather than a second spelling of the place, this
  // fallback files a tally under voting place 1. It is kept only because the
  // alternative has not been confirmed either, and the live listener queries
  // `voting_place_id`, so a document carrying only the other name never
  // reaches here in the first place.
  const votingPlace = toInt(raw.voting_place_id ?? raw.voting_place_no)

  return {
    key: resultsSetKey({
      results_level: level,
      results_category: category,
      electorate,
      voting_place: votingPlace,
      result_number: toInt(raw.result_number),
      firestore_id: documentId,
    }),
    results_level: level,
    results_category: category,
    results_type: (toStringOrNull(raw.results_type) ?? 'actual') as ResultsSet['results_type'],
    electorate,
    voting_place: votingPlace,
    voting_place_electorate: toInt(raw.voting_place_location_electorate_id),
    result_number: toInt(raw.result_number),
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
    firestore_id: documentId,
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

/* -------------------------------------------------------------------------
 * Summary
 *
 * Written by `election-summary-worker`, not by the results worker, so this is
 * the one Firestore document whose shape this project controls. It is still
 * normalised here, for the same two reasons as everything else: the ids are
 * `*_id` on the wire and bare in the contract, and a document written by an
 * older worker must still render.
 * ---------------------------------------------------------------------- */

function normaliseSummaryCandidate(raw: unknown): SummaryCandidate | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Raw

  const candidate = toInt(row.candidate_id)
  const count = toInt(row.count)
  // Both are required for the row to mean anything. A leader with no count
  // cannot be compared against a runner up, so treat it as absent.
  if (candidate === null || count === null) return null

  return { candidate, count, per_cent: toFloat(row.per_cent) }
}

function normaliseSummaryElectorate(raw: Raw): SummaryElectorate | null {
  const electorate = toInt(raw.electorate_id)
  if (electorate === null) return null

  return {
    electorate,
    is_final: toBool(raw.is_final),
    percent_votes_cast: toFloat(raw.percent_votes_cast),
    total_votes_cast: toInt(raw.total_votes_cast) ?? 0,
    leader: normaliseSummaryCandidate(raw.leader),
    runner_up: normaliseSummaryCandidate(raw.runner_up),
  }
}

export function normaliseFirestoreSummary(raw: Raw): ResultsSummary {
  const updated = toIsoString(raw.updated)

  return {
    event_id: toStringOrNull(raw.event_id) ?? '',
    is_live: toBool(raw.is_live),
    is_final: toBool(raw.is_final),
    sequence: toInt(raw.sequence),
    updated,
    updated_timestamp: toEpochSeconds(raw.updated_timestamp, updated),
    electorates: Array.isArray(raw.electorates)
      ? (raw.electorates as Raw[])
          .map(normaliseSummaryElectorate)
          .filter((entry): entry is SummaryElectorate => entry !== null)
      : [],
  }
}

/* -------------------------------------------------------------------------
 * Feed
 *
 * Written by `election-feed-worker`, and by hand in the Firebase console for a
 * service announcement. The hand-written case is why this normaliser is more
 * forgiving than the others: a document typed into a console will have fields
 * missing, and an entry with a title and a body is still worth showing even if
 * its metadata is empty.
 * ---------------------------------------------------------------------- */

function metadataOf(raw: Raw): Raw {
  const metadata = raw.metadata
  return metadata && typeof metadata === 'object' ? metadata as Raw : {}
}

function normaliseAnnouncement(meta: Raw): ServiceAnnouncementMetadata {
  return {
    url: toStringOrNull(meta.url),
    // Defaults to navigating within the app, which is the safe way round: an
    // internal path opened in a new tab still works, where an external URL
    // handed to the router does not.
    external: toBool(meta.external),
  }
}

function normaliseLeadChange(meta: Raw): ElectorateLeadChangeMetadata {
  return {
    electorate: toInt(meta.electorate_id),
    leader: toInt(meta.leader_candidate_id),
    runner_up: toInt(meta.runner_up_candidate_id),
    previous_leader: toInt(meta.previous_leader_candidate_id),
    margin: toInt(meta.margin),
    percent_votes_cast: toFloat(meta.percent_votes_cast),
  }
}

function normaliseVotingPlaceAdded(meta: Raw): VotingPlaceAddedMetadata {
  return {
    voting_place: toInt(meta.voting_place_id),
    physical_electorate: toInt(meta.physical_electorate_id),
    electorate: toInt(meta.electorate_id),
  }
}

function normaliseCompositionChange(raw: unknown): CompositionChange | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Raw

  const before = toInt(row.before)
  const after = toInt(row.after)
  // A change with nothing on either side of it says nothing. Both are required
  // even where one is zero, which is a party entering or leaving the House.
  if (before === null || after === null) return null

  return { party: toInt(row.party_id), before, after }
}

function normaliseComposition(meta: Raw): CompositionChangedMetadata {
  return {
    house_size: toInt(meta.house_size),
    changes: Array.isArray(meta.changes)
      ? meta.changes
          .map(normaliseCompositionChange)
          .filter((change): change is CompositionChange => change !== null)
      : [],
  }
}

const FEED_MESSAGE_TYPES: readonly FeedMessageType[] = [
  'SERVICE_ANNOUNCEMENT',
  'ELECTORATE_LEAD_CHANGE',
  'VOTING_PLACE_ADDED',
  'COMPOSITION_CHANGED',
]

/**
 * One feed document.
 *
 * Returns null for anything this client cannot render: a message with no
 * title, and a message of a type it does not know. The second is the one that
 * matters -- a later worker introducing a fifth type must not put untyped
 * metadata in front of a reader, and dropping it here means an older client
 * stays correct rather than merely surviving.
 */
export function normaliseFirestoreFeedMessage(documentId: string, raw: Raw): FeedMessage | null {
  const declared = toStringOrNull(raw.type)
  if (!declared || !FEED_MESSAGE_TYPES.includes(declared as FeedMessageType)) return null
  const type = declared as FeedMessageType

  const title = toStringOrNull(raw.title)
  if (!title) return null

  const timestamp = toIsoString(raw.timestamp)

  const base: FeedMessageBase = {
    id: documentId,
    event_id: toStringOrNull(raw.event_id) ?? '',
    title,
    // A title alone is a legitimate announcement, so an absent body is empty
    // rather than a reason to drop the message.
    body: toStringOrNull(raw.body) ?? '',
    timestamp,
    timestamp_seconds: toEpochSeconds(raw.timestamp_seconds, timestamp),
  }

  const meta = metadataOf(raw)

  switch (type) {
    case 'SERVICE_ANNOUNCEMENT':
      return { ...base, type, metadata: normaliseAnnouncement(meta) }
    case 'ELECTORATE_LEAD_CHANGE':
      return { ...base, type, metadata: normaliseLeadChange(meta) }
    case 'VOTING_PLACE_ADDED':
      return { ...base, type, metadata: normaliseVotingPlaceAdded(meta) }
    case 'COMPOSITION_CHANGED':
      return { ...base, type, metadata: normaliseComposition(meta) }
  }
}
