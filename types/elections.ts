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
    /** Every place within one electorate: `${base}${electorateNumber}.json`. */
    by_electorate_base: string
    by_electorate_count: number
    /**
     * Every electorate one place issued votes for:
     * `${base}${votingPlaceNumber}.json`.
     *
     * The opposite sharding, and not derivable from the one above: a place
     * serves several electorates, so its own tallies are spread across their
     * files. Optional because a manifest published before these existed does
     * not carry it.
     */
    by_place_base?: string
    by_place_count?: number
  }
}

/* -------------------------------------------------------------------------
 * Incumbency and blocs, curated in Django and carried in the manifest
 * ---------------------------------------------------------------------- */

/**
 * The two political blocs, as ordered persistent party ids.
 *
 * One rule decides the whole seating plan: `[...left, ...crossbench, ...right]`
 * reads from the far left of the chamber to the far right. So `left` is curated
 * far-left first, `right` is curated centre first, and a party in neither list
 * is cross-bench and sits in the middle.
 *
 * Null on a version nobody has aligned, which is every archived election. The
 * ordering then falls back to size, exactly as it did before blocs existed.
 */
export interface PartyBlocs {
  left: PersistentId[]
  right: PersistentId[]
}

/**
 * Who held one electorate going into this election.
 *
 * `party` is the party the seat was *won* for, which is what a flip is measured
 * against. Where the sitting member has since left it, `left_party` says so and
 * `current_party` says where they sit now -- absent there means they sit as an
 * independent. That pair is curated in Django because a member who crossed the
 * floor and is not standing again leaves nothing in the candidate list to infer
 * it from. Everything else about a seat is derived: see `useIncumbency`.
 *
 * `candidate` is absent where the seat was vacant going in.
 */
export interface ElectorateIncumbency {
  electorate: PersistentId
  candidate: PersistentId | null
  party: PersistentId | null
  left_party: boolean
  current_party: PersistentId | null
}

/** How many seats a party held at dissolution, to compare the result against. */
export interface PartyIncumbency {
  party: PersistentId
  electorate_seats: number
  list_seats: number
}

export interface Incumbency {
  electorates: ElectorateIncumbency[]
  parties: PartyIncumbency[]
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
  /**
   * Social card image for this version, as an absolute URL.
   *
   * Uploaded in Django and resolved to a public media URL by the manifest, so
   * the client never builds it. Null where no card has been uploaded, which is
   * the usual case -- the page then emits no image meta and shares as a plain
   * summary card.
   */
  card_image_url: string | null
  paths: ResultsVersionPaths
  /**
   * The two political blocs, or null where neither has been curated.
   *
   * Carried in the manifest rather than a payload because it is a curated
   * description of the event, so editing it in Django reaches clients on the
   * save with nothing to publish. Django omits the key entirely where there is
   * nothing to say, which keeps the one object every visitor fetches small.
   */
  blocs: PartyBlocs | null
  /** Who held what going in, or null where nothing has been curated. */
  incumbency: Incumbency | null
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

/**
 * A voting place as the Algolia index holds it.
 *
 * A different shape from `ReferenceVotingPlace`, and deliberately not
 * normalised into it: the index is denormalised for searching, so it carries
 * the electorate's name as well as its number, and it is the only source that
 * can rank places by distance. Fields mirror `ElectionVotingPlaceIndex` in
 * `wts_app/index.py` -- keep the two in step.
 *
 * Note what is absent, because it does not exist anywhere upstream: no venue
 * name, no opening hours, no advance-voting or polling-day flag. The address
 * is the only identifying string a place has.
 */
export interface VotingPlaceHit {
  /** The Django UUID, which is also the Algolia objectID. */
  objectID: string
  number: EntityNumber
  address: string
  electorate_name: string
  electorate_number: EntityNumber
  latitude: number | null
  longitude: number | null
  /** Absent where the place has never been geocoded. */
  _geoloc?: { lat: number, lng: number }
  persistent_voting_place: PersistentId | null
  /**
   * Metres from the search origin, read from Algolia's `_rankingInfo` rather
   * than computed here, so the figure shown cannot disagree with the order the
   * results came back in. Null outside a proximity search.
   */
  distanceMetres?: number | null
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
  /**
   * The Firestore document id, where this tally has one.
   *
   * Part of the identity of a voting place set rather than mere provenance.
   * The Commission has published advance votes and polling-day votes as
   * separate sets for the same place, which level, category, electorate and
   * place cannot tell apart; `result_number` is the field for that and nothing
   * populates it. So this stands in, because it is the one discriminator both
   * transports hold -- Django's `firebase_id` is the same id, and the snapshot
   * carries it for this reason. See `resultsSetKey`.
   */
  firestore_id: string | null
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
 * The home page and the site's electorates list both highlight close races.
 * Doing that from the results documents themselves is one Firestore document
 * per electorate -- 72 of them, per visitor -- so `election-summary-worker`
 * spends those reads once a minute on everybody's behalf and writes this.
 * Reading it is one document.
 *
 * It carries results and nothing else: no electorate names, no candidate
 * names, no parties, no colours. Those are reference data, and a consumer that
 * renders a row holds reference data already. Entity numbers are the Electoral
 * Commission's own and mean nothing outside one results version, which is why
 * the document is scoped to an event.
 *
 * Two consequences worth knowing before rendering it:
 *
 *   - An electorate with nothing reported is absent, not present and empty.
 *     The worker learns which electorates exist from the results documents.
 *   - A margin is not stored, because it is `leader.count - runner_up.count`.
 */
export interface SummaryCandidate {
  candidate: EntityNumber
  count: number
  /** Share of the candidate votes counted in that electorate. Computed upstream. */
  per_cent: number | null
}

export interface SummaryElectorate {
  electorate: EntityNumber
  is_final: boolean
  /** How much of the electorate is counted, from the feed's own statistics. */
  percent_votes_cast: number | null
  /**
   * Candidate votes counted here, and the denominator of both `per_cent`
   * values. Informals are not in it.
   */
  total_votes_cast: number
  /**
   * The top two by count. Both null until something is counted, which is the
   * distinction `total_votes_cast` is here to make: two candidates level on a
   * real tally is a tie, two candidates level on nothing is a count that has
   * not started, and at the moment polls close every candidate is on zero.
   */
  leader: SummaryCandidate | null
  runner_up: SummaryCandidate | null
}

export interface ResultsSummary {
  event_id: string
  /** Mirrored from the event document, so one read covers "is it still live". */
  is_live: boolean
  is_final: boolean
  /** Monotonic; the store rejects a summary that is not newer than the one held. */
  sequence: number | null
  updated: string | null
  updated_timestamp: number | null
  electorates: SummaryElectorate[]
}

/* -------------------------------------------------------------------------
 * Feed
 * ---------------------------------------------------------------------- */

/**
 * The running commentary on a count, as the `feed` collection holds it.
 *
 * One document per message. Almost all of them are written by
 * `election-feed-worker`, which watches the results documents and turns
 * changes into entries; a service announcement is added by hand in the
 * Firebase console. Nothing is written from this client, and nothing is
 * written from Django -- the feed lives entirely in Firestore, so an archived
 * event has no feed at all rather than a published copy of one.
 *
 * Readers listen to the latest 20 for their event. The listener is only ever
 * opened in live mode, because that is the only time there is anything to
 * read.
 *
 * Every message carries a title, a body and a timestamp, written upstream.
 * Wording is the worker's business, not this client's: the worker holds the
 * reference data that names an electorate or a candidate at the moment the
 * entry is written, so an entry still reads correctly even where a later
 * lookup here would not resolve. Metadata exists to link the entry to the
 * entities it is about, not to rebuild its text.
 *
 * Entity numbers are the Electoral Commission's own and mean nothing outside
 * one results version, which is why every message is scoped to an event.
 */
export type FeedMessageType =
  | 'SERVICE_ANNOUNCEMENT'
  | 'ELECTORATE_LEAD_CHANGE'
  | 'VOTING_PLACE_ADDED'
  | 'COMPOSITION_CHANGED'

export interface FeedMessageBase {
  /** The document id. Deterministic for a worker message, so a replay overwrites. */
  id: string
  event_id: string
  title: string
  body: string
  /** ISO 8601, normalised from whatever the document carries. */
  timestamp: string | null
  /** Epoch seconds, which is what the list is ordered by. */
  timestamp_seconds: number | null
}

/** A message posted by hand, which may point somewhere. */
export interface ServiceAnnouncementMetadata {
  url: string | null
  /**
   * True opens the URL in a new tab; false navigates within the app.
   *
   * Written alongside the URL rather than guessed from it, because an absolute
   * URL on this site's own domain should still navigate internally.
   */
  external: boolean
}

/**
 * The leader in an electorate has changed.
 *
 * Never emitted for the first leader -- there was nobody to overtake, and the
 * Commission's first drop would otherwise put 72 entries into the feed at
 * once. A tie is reported as an ordinary lead change with `margin` zero, which
 * is the same convention `computeElectorateResult` uses in the store.
 */
export interface ElectorateLeadChangeMetadata {
  electorate: EntityNumber | null
  leader: EntityNumber | null
  runner_up: EntityNumber | null
  /** Who was displaced. Null only where an older worker wrote the message. */
  previous_leader: EntityNumber | null
  /** Votes between the leader and the runner up. Zero means they are level. */
  margin: number | null
  /** How much of the electorate was counted when the lead changed. */
  percent_votes_cast: number | null
}

export interface VotingPlaceAddedMetadata {
  voting_place: EntityNumber | null
  /** Where the place physically sits, which need not be `electorate`. */
  physical_electorate: EntityNumber | null
  /** The electorate the votes were counted for. */
  electorate: EntityNumber | null
}

/** One party's seat count before and after a change in the projection. */
export interface CompositionChange {
  party: EntityNumber | null
  before: number
  after: number
}

/**
 * The projected composition of Parliament has changed.
 *
 * Only the parties that moved, so the entry can read "Labour 34 to 35" without
 * the client diffing anything against a message it may never have seen. The
 * projection uses the official settings, never a reader's own threshold or
 * formula.
 */
export interface CompositionChangedMetadata {
  house_size: number | null
  changes: CompositionChange[]
}

export type FeedMessage =
  | (FeedMessageBase & { type: 'SERVICE_ANNOUNCEMENT', metadata: ServiceAnnouncementMetadata })
  | (FeedMessageBase & { type: 'ELECTORATE_LEAD_CHANGE', metadata: ElectorateLeadChangeMetadata })
  | (FeedMessageBase & { type: 'VOTING_PLACE_ADDED', metadata: VotingPlaceAddedMetadata })
  | (FeedMessageBase & { type: 'COMPOSITION_CHANGED', metadata: CompositionChangedMetadata })

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
  /** The per-electorate summary, which exists only during a live count. */
  summary: PayloadProvenance
}
