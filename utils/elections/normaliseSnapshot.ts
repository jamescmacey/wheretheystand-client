/**
 * Normalise published snapshots into the canonical contract.
 *
 * These payloads are rendered by the Django serializers and uploaded to R2, so
 * they already arrive in the right shape. This layer exists to give the
 * compiler something to check, to fill defaults where a field is absent, and so
 * that pointing the client at a local Django instance during development goes
 * through exactly the same path as production.
 */

import type {
  ElectionManifest,
  ElectionSummary,
  PersistentCandidate,
  PersistentData,
  PersistentElectorate,
  PersistentParty,
  PersistentVotingPlace,
  ReferenceCandidate,
  ReferenceData,
  ReferenceElectorate,
  ReferenceParty,
  ReferenceVotingPlace,
  Result,
  ResultsSet,
  ResultsStatistics,
  ResultsVersion,
  ResultsVersionPaths,
} from '~/types/elections'
import { resultsSetKey } from './keys'
import { toBool, toEpochSeconds, toFloat, toInt, toIsoString, toStringOrNull } from './coerce'

type Raw = Record<string, unknown>

const asArray = (value: unknown): Raw[] => (Array.isArray(value) ? (value as Raw[]) : [])
const asObject = (value: unknown): Raw =>
  value && typeof value === 'object' ? (value as Raw) : {}

/** Every statistic, always present, so components never guard for the key. */
export function normaliseStatistics(raw: unknown): ResultsStatistics {
  const source = asObject(raw)
  const read = (name: keyof ResultsStatistics) => toFloat(source[name])
  return {
    total_voting_places_counted: read('total_voting_places_counted'),
    percent_voting_places_counted: read('percent_voting_places_counted'),
    total_votes_cast: read('total_votes_cast'),
    percent_votes_cast: read('percent_votes_cast'),
    total_electorates_final: read('total_electorates_final'),
    percent_electorates_final: read('percent_electorates_final'),
    total_minimal_votes: read('total_minimal_votes'),
    total_special_votes: read('total_special_votes'),
    total_registered_parties: read('total_registered_parties'),
    total_voting_places: read('total_voting_places'),
    total_party_informals: read('total_party_informals'),
    total_candidate_informals: read('total_candidate_informals'),
    total_candidates: read('total_candidates'),
    total_issued_ballot_papers: read('total_issued_ballot_papers'),
  }
}

function normaliseResult(raw: Raw): Result {
  return {
    candidate: toInt(raw.candidate),
    party: toInt(raw.party),
    count: toInt(raw.count),
    per_cent: toFloat(raw.per_cent),
    list_seats: toInt(raw.list_seats),
    electorate_seats: toInt(raw.electorate_seats),
    total_seats: toInt(raw.total_seats),
  }
}

export function normaliseSnapshotResultsSet(raw: Raw): ResultsSet {
  const updated = toIsoString(raw.updated)
  const level = String(raw.results_level) as ResultsSet['results_level']
  const category = String(raw.results_category) as ResultsSet['results_category']
  const electorate = toInt(raw.electorate)
  const votingPlace = toInt(raw.voting_place)
  const resultNumber = toInt(raw.result_number)

  return {
    // Recomputed rather than trusted, so that a snapshot and a live document
    // cannot disagree about a set's identity.
    key: resultsSetKey({
      results_level: level,
      results_category: category,
      electorate,
      voting_place: votingPlace,
      result_number: resultNumber,
    }),
    results_level: level,
    results_category: category,
    results_type: (toStringOrNull(raw.results_type) ?? 'actual') as ResultsSet['results_type'],
    electorate,
    voting_place: votingPlace,
    voting_place_electorate: toInt(raw.voting_place_electorate),
    result_number: resultNumber,
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
    results: asArray(raw.results).map(normaliseResult),
    transport: 'snapshot',
    source_id: toStringOrNull(raw.source_id),
  }
}

export function normaliseSnapshotResults(raw: unknown): ResultsSet[] {
  return asArray(asObject(raw).results_sets).map(normaliseSnapshotResultsSet)
}

/* ---------------------------------------------------------------------- */

function normaliseElectorate(raw: Raw): ReferenceElectorate {
  return {
    number: toInt(raw.number) ?? 0,
    name: String(raw.name ?? ''),
    accepting_candidate_votes: toBool(raw.accepting_candidate_votes, true),
    persistent_electorate: toStringOrNull(raw.persistent_electorate),
    id: toStringOrNull(raw.id) ?? undefined,
  }
}

function normaliseParty(raw: Raw): ReferenceParty {
  return {
    number: toInt(raw.number) ?? 0,
    name: String(raw.name ?? ''),
    short_name: toStringOrNull(raw.short_name),
    abbreviation: toStringOrNull(raw.abbreviation),
    registered: toBool(raw.registered),
    persistent_party: toStringOrNull(raw.persistent_party),
    id: toStringOrNull(raw.id) ?? undefined,
  }
}

function normaliseCandidate(raw: Raw): ReferenceCandidate {
  return {
    number: toInt(raw.number) ?? 0,
    name: String(raw.name ?? ''),
    electorate: toInt(raw.electorate),
    party: toInt(raw.party),
    list_pos: toInt(raw.list_pos),
    is_dead: toBool(raw.is_dead),
    persistent_candidate: toStringOrNull(raw.persistent_candidate),
    id: toStringOrNull(raw.id) ?? undefined,
  }
}

function normaliseVotingPlace(raw: Raw): ReferenceVotingPlace {
  return {
    number: toInt(raw.number) ?? 0,
    physical_electorate: toInt(raw.physical_electorate),
    address: String(raw.address ?? ''),
    latitude: toFloat(raw.latitude),
    longitude: toFloat(raw.longitude),
    persistent_voting_place: toStringOrNull(raw.persistent_voting_place),
    id: toStringOrNull(raw.id) ?? undefined,
  }
}

export function normaliseSnapshotReferenceData(raw: unknown): ReferenceData {
  const source = asObject(raw)
  return {
    electorates: asArray(source.electorates).map(normaliseElectorate),
    parties: asArray(source.parties).map(normaliseParty),
    candidates: asArray(source.candidates).map(normaliseCandidate),
    voting_places: asArray(source.voting_places).map(normaliseVotingPlace),
  }
}

export function normaliseSnapshotVotingPlaces(raw: unknown): ReferenceVotingPlace[] {
  return asArray(asObject(raw).voting_places).map(normaliseVotingPlace)
}

/* ---------------------------------------------------------------------- */

export function normaliseSnapshotPersistentData(raw: unknown): PersistentData {
  const source = asObject(raw)
  return {
    persistent_electorates: asArray(source.persistent_electorates).map(
      (item): PersistentElectorate => ({
        id: String(item.id),
        name: String(item.name ?? ''),
        slug: toStringOrNull(item.slug),
        region: toStringOrNull(item.region),
        electorate_type: (toStringOrNull(item.electorate_type) ?? 'general') as
          PersistentElectorate['electorate_type'],
        status: String(item.status ?? ''),
        legacy_id: toInt(item.legacy_id),
      })),
    persistent_parties: asArray(source.persistent_parties).map(
      (item): PersistentParty => ({
        id: String(item.id),
        display_name: toStringOrNull(item.display_name),
        short_name: toStringOrNull(item.short_name),
        abbreviation: toStringOrNull(item.abbreviation),
        colour: toStringOrNull(item.colour),
        party: toStringOrNull(item.party),
        firebase_id: toStringOrNull(item.firebase_id),
      })),
    persistent_candidates: asArray(source.persistent_candidates).map(
      (item): PersistentCandidate => ({
        id: String(item.id),
        display_name: String(item.display_name ?? ''),
        person: toStringOrNull(item.person),
        firebase_id: toStringOrNull(item.firebase_id),
      })),
    persistent_voting_places: asArray(source.persistent_voting_places).map(
      (item): PersistentVotingPlace => ({
        id: String(item.id),
        address: String(item.address ?? ''),
        latitude: toFloat(item.latitude),
        longitude: toFloat(item.longitude),
        firebase_id: toStringOrNull(item.firebase_id),
      })),
  }
}

/* ---------------------------------------------------------------------- */

/**
 * The published payload paths for one results version.
 *
 * Django writes the same map into the manifest and into the Firestore event
 * document, so both are parsed here and cannot drift into disagreeing about
 * what a path is called.
 */
export function normaliseVersionPaths(raw: unknown): ResultsVersionPaths {
  const paths = asObject(raw)
  const votingPlaces = paths.voting_places ? asObject(paths.voting_places) : null

  return {
    persistent: String(paths.persistent ?? ''),
    reference: String(paths.reference ?? ''),
    results: String(paths.results ?? ''),
    ...(votingPlaces
      ? {
          voting_places: {
            reference: String(votingPlaces.reference ?? ''),
            by_electorate_base: String(votingPlaces.by_electorate_base ?? ''),
            by_electorate_count: toInt(votingPlaces.by_electorate_count) ?? 0,
          },
        }
      : {}),
  }
}

function normaliseResultsVersion(raw: Raw): ResultsVersion {
  return {
    id: String(raw.id),
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    description: toStringOrNull(raw.description),
    is_primary: toBool(raw.is_primary),
    access_mode: (toStringOrNull(raw.access_mode) ?? 'api') as ResultsVersion['access_mode'],
    firebase_id: toStringOrNull(raw.firebase_id),
    is_live: toBool(raw.is_live),
    is_final: toBool(raw.is_final),
    refdata_built: toBool(raw.refdata_built),
    paths: normaliseVersionPaths(raw.paths),
  }
}

export function normaliseElectionSummary(raw: Raw): ElectionSummary {
  return {
    id: String(raw.id),
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    election_type: (toStringOrNull(raw.election_type) ?? 'general') as
      ElectionSummary['election_type'],
    polling_date: toStringOrNull(raw.polling_date),
    polls_close: toIsoString(raw.polls_close),
    results_versions: asArray(raw.results_versions).map(normaliseResultsVersion),
  }
}

export function normaliseManifest(raw: unknown): ElectionManifest {
  const source = asObject(raw)
  return {
    version: toInt(source.version) ?? 1,
    snapshot_base: String(source.snapshot_base ?? ''),
    elections: asArray(source.elections).map(normaliseElectionSummary),
  }
}
