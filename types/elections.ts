/**
 * The canonical election results contract.
 *
 * Results reach the dashboard by three routes: static snapshots on R2, live
 * documents from Firestore during an event, and the Django API in development.
 * Every one of them normalises into the types below, so components never branch
 * on where their data came from. Only the status indicator knows the difference.
 *
 * Each normaliser is declared to return these types, which is what makes
 * `nuxt typecheck` a genuine guard on the sources agreeing.
 *
 * Identity works in two spaces, and the split is deliberate.
 *
 * Election-scoped entities use `number`: the Electoral Commission's own
 * integers, which are what Firestore results carry. Those integers are stable
 * within an election but may be reused between them, so a number only means
 * something alongside a results version. Every lookup here is scoped to one.
 *
 * Persistent entities use the Django UUID, because they exist precisely to
 * survive across elections and so cannot be keyed on a number that does not.
 */

export type ResultsLevel = 'national' | 'electorate' | 'voting_place'
export type ResultsCategory = 'party_votes' | 'candidate_votes'
export type ResultsType = 'actual' | 'poll' | 'custom'

/** How Django says an event's results should be reached. */
export type AccessMode = 'api' | 'firebase'

/** Whether results are arriving live or read from a published snapshot. */
export type SourceMode = 'live' | 'archive'

/** Which transport delivered a payload. For diagnostics only. */
export type Transport = 'firestore' | 'snapshot' | 'django'

/** A Django UUID identifying a persistent entity. */
export type PersistentId = string

/** An Electoral Commission number, unique only within a results version. */
export type EntityNumber = number

/* -------------------------------------------------------------------------
 * Manifest
 * ---------------------------------------------------------------------- */

export interface ResultsVersionPaths {
  persistent: string
  reference: string
  results: string
  voting_places?: {
    reference: string
    by_electorate_base: string
    by_electorate_count: number
  }
}

export interface ResultsVersion {
  id: string
  slug: string
  name: string
  description: string | null
  is_primary: boolean
  access_mode: AccessMode
  firebase_id: string | null
  /**
   * The switch that puts the dashboard into live mode.
   *
   * Read from the manifest, so it is known before any connection is opened and
   * decides the transport on its own: true means Firestore, false means the
   * published snapshots. Taking a count off live mid-event is done on the
   * Firestore event document instead, which reaches open pages at once rather
   * than waiting on the manifest's cache lifetime.
   */
  is_live: boolean
  is_final: boolean
  refdata_built: boolean
  paths: ResultsVersionPaths
}

export interface ElectionSummary {
  id: string
  slug: string
  name: string
  election_type: 'general' | 'by-election'
  /** ISO date, no time. */
  polling_date: string | null
  /** ISO 8601 datetime. */
  polls_close: string | null
  results_versions: ResultsVersion[]
}

export interface ElectionManifest {
  version: number
  snapshot_base: string
  elections: ElectionSummary[]
}

/* -------------------------------------------------------------------------
 * Reference data, scoped to one results version
 * ---------------------------------------------------------------------- */

export interface ReferenceElectorate {
  number: EntityNumber
  name: string
  /** False where a candidate election was cancelled, e.g. a candidate died. */
  accepting_candidate_votes: boolean
  persistent_electorate: PersistentId | null
  id?: string
}

export interface ReferenceParty {
  number: EntityNumber
  name: string
  short_name: string | null
  abbreviation: string | null
  registered: boolean
  persistent_party: PersistentId | null
  id?: string
}

export interface ReferenceCandidate {
  number: EntityNumber
  name: string
  electorate: EntityNumber | null
  party: EntityNumber | null
  list_pos: number | null
  is_dead: boolean
  persistent_candidate: PersistentId | null
  id?: string
}

export interface ReferenceVotingPlace {
  number: EntityNumber
  physical_electorate: EntityNumber | null
  address: string
  latitude: number | null
  longitude: number | null
  persistent_voting_place: PersistentId | null
  id?: string
}

export interface ReferenceData {
  electorates: ReferenceElectorate[]
  parties: ReferenceParty[]
  candidates: ReferenceCandidate[]
  /** Empty unless voting place data has been loaded; there are thousands. */
  voting_places: ReferenceVotingPlace[]
}

/* -------------------------------------------------------------------------
 * Persistent data, shared across elections
 * ---------------------------------------------------------------------- */

export interface PersistentParty {
  id: PersistentId
  display_name: string | null
  short_name: string | null
  abbreviation: string | null
  colour: string | null
  /** The site's own party record, for linking to /parties/:id. */
  party: string | null
  firebase_id: string | null
}

export interface PersistentCandidate {
  id: PersistentId
  display_name: string
  /** The site's own person record, for linking to /people/:id. */
  person: string | null
  firebase_id: string | null
}

export interface PersistentElectorate {
  id: PersistentId
  name: string
  slug: string | null
  region: string | null
  electorate_type: 'general' | 'maori'
  status: string
  /** Matches Firestore's numeric persistent_electorate_id. */
  legacy_id: number | null
}

export interface PersistentVotingPlace {
  id: PersistentId
  address: string
  latitude: number | null
  longitude: number | null
  firebase_id: string | null
}

export interface PersistentData {
  persistent_electorates: PersistentElectorate[]
  persistent_parties: PersistentParty[]
  persistent_candidates: PersistentCandidate[]
  persistent_voting_places: PersistentVotingPlace[]
}

/* -------------------------------------------------------------------------
 * Results
 * ---------------------------------------------------------------------- */

export interface ResultsStatistics {
  total_voting_places_counted: number | null
  percent_voting_places_counted: number | null
  total_votes_cast: number | null
  percent_votes_cast: number | null
  total_electorates_final: number | null
  percent_electorates_final: number | null
  total_minimal_votes: number | null
  total_special_votes: number | null
  total_registered_parties: number | null
  total_voting_places: number | null
  total_party_informals: number | null
  total_candidate_informals: number | null
  total_candidates: number | null
  total_issued_ballot_papers: number | null
}

export interface Result {
  candidate: EntityNumber | null
  party: EntityNumber | null
  count: number | null
  per_cent: number | null
  list_seats: number | null
  electorate_seats: number | null
  total_seats: number | null
}

export interface ResultsSet {
  /** Identifies this tally regardless of transport. See utils/elections/keys. */
  key: string
  results_level: ResultsLevel
  results_category: ResultsCategory
  results_type: ResultsType
  electorate: EntityNumber | null
  voting_place: EntityNumber | null
  /** Where a voting place physically sits, which need not be `electorate`. */
  voting_place_electorate: EntityNumber | null
  result_number: number | null
  informals: number | null
  unknowns: number | null
  refused: number | null
  sample_size: number | null
  is_final: boolean
  updated: string | null
  /**
   * Epoch seconds. Snapshots and live updates race, and Firestore can deliver
   * out of order, so the store rejects any set older than the one it holds.
   */
  updated_timestamp: number | null
  parsed: string | null
  received: string | null
  statistics: ResultsStatistics
  results: Result[]
  transport: Transport
  source_id: string | null
}

export type ElectorateResultStatus =
  | 'determined'
  | 'indeterminate'
  | 'defaulted'
  | 'no_candidates'
  /**
   * Candidates stood, but nothing has been counted for them yet.
   *
   * Distinct from `indeterminate`, and the distinction matters most at the
   * moment polls close: every candidate is on zero then, and reading equal
   * counts as a tie would declare every electorate too close to call.
   */
  | 'uncounted'

export interface ComputedElectorateResult {
  electorate: EntityNumber
  resultStatus: ElectorateResultStatus
  /** Candidate numbers. More than one where the leaders are tied. */
  firstPlace: EntityNumber[] | null
  secondPlace: EntityNumber[] | null
  margin: number | null
  marginPercentage: number | null
}

/* -------------------------------------------------------------------------
 * Summary
 * ---------------------------------------------------------------------- */

/**
 * A compact view of an event, for surfaces that need every electorate's state
 * at once without reading every electorate's results.
 *
 * The obvious case is highlighting close races on the home page: that needs a
 * margin per electorate, and the home page carries far more traffic than the
 * results dashboard, so reading 144 documents per visitor is not viable.
 */
export interface SummaryLeader {
  candidate: EntityNumber | null
  party: EntityNumber | null
  count: number | null
  per_cent: number | null
}

export interface SummaryElectorate {
  electorate: EntityNumber
  updated_timestamp: number | null
  is_final: boolean
  total_voting_places_counted: number | null
  total_voting_places: number | null
  percent_votes_cast: number | null
  informals: number | null
  leader: SummaryLeader | null
  runner_up: SummaryLeader | null
  /**
   * Two or more candidates are level on the lead, so `leader` is null and the
   * seat is undecided. Absent or false with a null leader means nothing has
   * been counted, which is a different thing.
   */
  tie?: boolean
  margin: number | null
  margin_per_cent: number | null
}

export interface ResultsSummary {
  event_id: string
  /** Monotonic; the store rejects a summary that is not newer than the one held. */
  sequence: number | null
  updated: string | null
  updated_timestamp: number | null
  is_final: boolean
  national: ResultsSet | null
  electorates: SummaryElectorate[]
}

/* -------------------------------------------------------------------------
 * Source status
 * ---------------------------------------------------------------------- */

export type ConnectionState = 'connecting' | 'live' | 'offline' | 'archived'

/**
 * The Firestore `events/{firebase_id}` document, as the client reads it.
 *
 * This is the whole of what an event tells the client about itself during a
 * live count, and it is the only thing that changes on the night. Every field
 * is optional on the wire: the client must render something sensible against a
 * document that is missing, empty, or written by an older worker.
 */
export interface LiveEventDocument {
  /**
   * Whether the count is still live, for clients already watching it.
   *
   * This does **not** decide which transport a page loads with -- the
   * manifest's `is_live` does that, before any Firestore connection is opened.
   * This is the signal that ends a count in progress: turning it off cancels
   * the results listeners, says so on screen, and drops back to the published
   * snapshots without a reload.
   */
  is_live: boolean
  /** The worker has finished building reference data for this event. */
  refdata_built: boolean
  /**
   * Where this version's payloads were last published, if they have been.
   *
   * The same map the manifest carries for this version, written by Django on
   * every publish. It is preferred over the manifest's copy during a live count
   * because it arrives on the open listener: the manifest is edge cached, so a
   * page already open would not see a republish for up to its cache lifetime.
   *
   * Null where the field is absent, which means this version has never been
   * published or an older Django wrote the document. The manifest answers in
   * that case, and reading reference data out of Firestore is the last resort.
   */
  paths: ResultsVersionPaths | null
}

/**
 * What the results version page is showing right now.
 *
 * One value drives the whole gate, rather than the several overlapping booleans
 * this replaced. The dashboard renders only at `ready`, which during a live
 * count means polls have closed and persistent data, reference data and a
 * national tally have all arrived.
 */
export type DashboardPhase =
  | 'countdown'
  | 'awaiting-refdata'
  | 'loading'
  | 'awaiting-results'
  | 'ready'
  | 'error'

/* -------------------------------------------------------------------------
 * Provenance
 * ---------------------------------------------------------------------- */

/** Where a payload was actually read from. */
export type PayloadOrigin = 'r2' | 'firestore'

/**
 * Where one payload came from on this visit, as opposed to where it could have.
 *
 * Reference data in particular has two possible sources and the choice is made
 * at runtime from the event document, with a fallback. Nothing on screen
 * reveals which one answered, and the difference is the entire Firestore bill,
 * so it is recorded as the load happens rather than inferred afterwards.
 */
export interface PayloadProvenance {
  origin: PayloadOrigin | null
  /** The URL fetched, where the origin was R2. */
  url: string | null
  /** When the payload last landed. */
  loadedAt: Date | null
  /** Why the last attempt failed, if it did. Cleared by a later success. */
  error: string | null
}

/** Provenance for each of the three payloads a results version is built from. */
export interface SourceProvenance {
  persistent: PayloadProvenance
  reference: PayloadProvenance
  results: PayloadProvenance
}
