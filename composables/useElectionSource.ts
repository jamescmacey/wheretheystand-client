import type {
  ConnectionState,
  DashboardPhase,
  ElectionSummary,
  EntityNumber,
  LiveEventDocument,
  PayloadOrigin,
  ReferenceData,
  ResultsVersion,
  SourceMode,
  SourceProvenance,
} from '~/types/elections'
import {
  normaliseSnapshotPersistentData,
  normaliseSnapshotReferenceData,
  normaliseSnapshotResults,
  normaliseSnapshotVotingPlaces,
} from '~/utils/elections/normaliseSnapshot'
import { snapshotUrl } from './useElectionManifest'
import { useFirestoreResults, type ResultsScope } from './useFirestoreResults'
import { fetchFirestoreReference, watchLiveEvent } from './useFirestoreReference'
import { useElectionDataStore } from '~/stores/electionData'

export const ELECTION_SOURCE_KEY = Symbol('election-source') as InjectionKey<ElectionSource>

export interface ElectionSource {
  mode: ComputedRef<SourceMode>
  connection: ComputedRef<ConnectionState>
  /**
   * The count was live when this page loaded and has since been taken off.
   * Distinct from a plain archive, which was never live in this visit.
   */
  liveEnded: ComputedRef<boolean>
  /** What the results version page should be showing. Drives the whole gate. */
  phase: ComputedRef<DashboardPhase>
  error: Ref<unknown>
  /** When the newest tally on screen was last updated at source. */
  lastUpdated: ComputedRef<Date | null>
  percentCounted: ComputedRef<number | null>
  votingPlacesCounted: ComputedRef<number | null>
  votingPlacesTotal: ComputedRef<number | null>
  isFinal: ComputedRef<boolean>
  /** Re-read the published payloads. Archived events only; live has no snapshot. */
  refresh: () => Promise<void>
  loadVotingPlaces: (electorate: EntityNumber) => Promise<void>
  /**
   * Ask for the electorate-level documents this page needs.
   *
   * Prefer `useResultsScope`, which releases the subscription automatically.
   * National results are always subscribed, so the overview asks for nothing.
   */
  watchScope: (scope: ResultsScope | null) => void
  /** What the secondary subscription is currently covering, if anything. */
  activeScope: Readonly<Ref<ResultsScope | null>>
  /**
   * The Firestore event document, where one is being watched.
   *
   * Null outside live mode, and also while the first read is in flight or where
   * no such document exists -- see `LiveEventDocument`. Exposed for the debug
   * page; nothing a reader sees should branch on it.
   */
  liveEvent: ComputedRef<LiveEventDocument | null>
  /**
   * Where each payload was actually read from on this visit.
   *
   * Recorded as the loads happen, because it cannot be worked out afterwards:
   * reference data has two possible sources with a fallback between them, and
   * which one answered is invisible everywhere else.
   */
  provenance: Readonly<Ref<SourceProvenance>>
}

/**
 * Load a results version, and keep it loaded.
 *
 * There are exactly two paths, and each has one transport for its tallies.
 *
 * **Archived**: everything from the published snapshots on R2, server rendered.
 * Static content, no Firestore connection at all.
 *
 * **Live**: nothing from R2 except persistent data, which is published long
 * beforehand and never changes during a count. The Firestore event document
 * says whether the event is live, whether reference data exists, and where to
 * read it; tallies stream from the `results` collection. Django is not in the
 * request path, so nothing has to be running on the night for this to work.
 *
 * Live mode is client only by design: the Firebase SDK cannot run on a
 * Cloudflare Worker, and a live dashboard renders behind a gate anyway, so
 * there is nothing for the server to usefully render.
 *
 * Instantiate this once per results version and provide it. Child pages read
 * the store directly and only inject this for status.
 */
export async function useElectionSource(options: {
  election: MaybeRefOrGetter<ElectionSummary | null>
  resultsVersion: MaybeRefOrGetter<ResultsVersion | null>
}): Promise<ElectionSource> {
  const store = useElectionDataStore()

  const election = computed(() => toValue(options.election))
  const resultsVersion = computed(() => toValue(options.resultsVersion))

  const error = ref<unknown>(null)

  /* ---------------------------------------------------------------------
   * Provenance
   * ------------------------------------------------------------------ */

  const emptyProvenance = (): SourceProvenance => ({
    persistent: { origin: null, url: null, loadedAt: null, error: null },
    reference: { origin: null, url: null, loadedAt: null, error: null },
    results: { origin: null, url: null, loadedAt: null, error: null },
    summary: { origin: null, url: null, loadedAt: null, error: null },
  })

  // In `useState`, not a plain ref, because an archived version is fetched on
  // the server and `useAsyncData` hydrates from the payload rather than running
  // its handler again. A ref would therefore be empty on the client for exactly
  // the loads that did happen.
  const provenance = useState<SourceProvenance>('election-provenance', emptyProvenance)

  type Payload = keyof SourceProvenance

  function noteLoaded(payload: Payload, origin: PayloadOrigin, url: string | null = null) {
    provenance.value[payload] = { origin, url, loadedAt: new Date(), error: null }
  }

  /** Record a failure without discarding an origin an earlier load established. */
  function noteFailed(payload: Payload, caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught)
    provenance.value[payload] = { ...provenance.value[payload], error: message }
  }

  const slugs = computed(() => ({
    election: election.value?.slug ?? '',
    version: resultsVersion.value?.slug ?? '',
  }))

  /* ---------------------------------------------------------------------
   * Deciding whether this is a live event
   * ------------------------------------------------------------------ */

  /**
   * The manifest decides which transport this page uses, and it decides alone.
   *
   * It is static, edge cached, readable on the server and already loaded before
   * anything here runs, so the choice is made once and immediately -- no
   * waiting on a network round trip to find out which path the page is on.
   */
  const manifestLive = computed(() => {
    const version = resultsVersion.value
    return Boolean(version?.is_live && version?.firebase_id)
  })

  // Stays attached for the whole visit, including after a count ends, so that
  // the switch being turned back on is picked up as readily as it being turned
  // off. One document either way.
  const { event: liveEvent } = watchLiveEvent({
    eventId: () => (manifestLive.value ? resultsVersion.value?.firebase_id ?? null : null),
    enabled: () => manifestLive.value,
  })

  /**
   * The count has been taken off live while someone was watching.
   *
   * Only an event document that exists and says so counts. A `null` here means
   * "not read yet" or "no such document", and neither is a statement that the
   * event has ended -- treating them as one would drop every client back to the
   * snapshots for the second or two before the first read lands.
   */
  const liveEnded = computed(() =>
    manifestLive.value && liveEvent.value !== null && !liveEvent.value.is_live)

  const mode = computed<SourceMode>(() =>
    manifestLive.value && !liveEnded.value ? 'live' : 'archive')

  /* ---------------------------------------------------------------------
   * Polls close
   * ------------------------------------------------------------------ */

  // Development and rehearsal escape hatch: treat polls as already closed, so
  // the dashboard can be worked on against a future election without waiting
  // for its real closing time. Public, because the gate is evaluated on both
  // sides of the render and the two must agree.
  const bypassCountdown = String(
    useRuntimeConfig().public.electionsBypassCountdown).toLowerCase() === 'true'

  const pollsClosed = ref(false)

  function evaluatePollsClosed() {
    if (bypassCountdown) {
      pollsClosed.value = true
      return
    }
    const closesAt = election.value?.polls_close
    // An election with no recorded closing time cannot be gated on one.
    pollsClosed.value = closesAt ? new Date() >= new Date(closesAt) : true
  }

  // Evaluated on the server too, so the markup it renders is not a guess that
  // the client immediately contradicts. Only the ticking is client-side; the
  // countdown itself is wrapped in ClientOnly, which is what makes the
  // remaining disagreement -- a skewed client clock -- harmless.
  evaluatePollsClosed()

  if (import.meta.client && !bypassCountdown) {
    const timer = setInterval(() => {
      evaluatePollsClosed()
      if (pollsClosed.value) clearInterval(timer)
    }, 1000)
    onScopeDispose(() => clearInterval(timer))
    watch(() => election.value?.polls_close, evaluatePollsClosed)
  }

  /* ---------------------------------------------------------------------
   * Live results subscriptions
   * ------------------------------------------------------------------ */

  const applyResults = (sets: Parameters<typeof store.applyResults>[2]) => {
    if (!slugs.value.election) return
    store.applyResults(slugs.value.election, slugs.value.version, sets)
    // Every delivery, not only the first: on a live count this doubles as when
    // the feed last said anything at all, which is not the same question as
    // when the newest tally was updated at source.
    noteLoaded('results', 'firestore')
  }

  // Always on during a live count, and the only subscription the overview
  // needs. It is also what satisfies the readiness gate on every page, so that
  // a visitor landing on the candidates list is not held up by 144 documents.
  const nationalLive = useFirestoreResults({
    eventId: () => (mode.value === 'live' ? resultsVersion.value?.firebase_id ?? null : null),
    scope: () => ({ kind: 'national' as const }),
    enabled: () => mode.value === 'live',
    onResults: applyResults,
  })

  /**
   * Every electorate's leader and margin, in one document.
   *
   * Always on during a live count, like the national tally, and for the same
   * reason: it is one document, and it is what lets the overview and the
   * electorates list show every margin without subscribing to every
   * electorate. 145 documents became two.
   *
   * It populates derived electorate outcomes only. Tallies still come from the
   * results listeners, so a page that needs every candidate's count -- the
   * candidates list -- still asks for the scope it needs.
   */
  useFirestoreSummary({
    eventId: () => (mode.value === 'live' ? resultsVersion.value?.firebase_id ?? null : null),
    enabled: () => mode.value === 'live',
    onSummary: (summary) => {
      if (!slugs.value.election) return
      store.applySummary(slugs.value.election, slugs.value.version, summary)
      noteLoaded('summary', 'firestore')
    },
  })

  // Whatever the open page additionally asked for. Null means no second
  // subscription, which is the overview's case.
  const scope = ref<ResultsScope | null>(null)

  const watchScope = (next: ResultsScope | null) => { scope.value = next }

  // Held only for its subscription; the page reads tallies from the store and
  // its connection state from the national listener above.
  useFirestoreResults({
    eventId: () => (mode.value === 'live' && scope.value
      ? resultsVersion.value?.firebase_id ?? null
      : null),
    scope: () => scope.value ?? { kind: 'national' as const },
    enabled: () => mode.value === 'live' && scope.value !== null,
    onResults: applyResults,
  })

  const connection = computed<ConnectionState>(() =>
    mode.value === 'live' ? nationalLive.connection.value : 'archived')

  /* ---------------------------------------------------------------------
   * What has arrived
   * ------------------------------------------------------------------ */

  const hasReferenceData = computed(() =>
    (store.referenceData(slugs.value.election, slugs.value.version)?.candidates.length ?? 0) > 0)

  const hasResults = computed(() =>
    Boolean(slugs.value.election)
    && store.hasResults(slugs.value.election, slugs.value.version))

  const nationalSet = computed(() => {
    if (!slugs.value.election) return null
    return store.nationalResults(slugs.value.election, slugs.value.version, 'party_votes')
      ?? store.nationalResults(slugs.value.election, slugs.value.version, 'candidate_votes')
  })

  const lastUpdated = computed(() => {
    if (!slugs.value.election) return null
    let newest: number | null = null
    for (const set of store.allResults(slugs.value.election, slugs.value.version)) {
      if (set.updated_timestamp === null) continue
      if (newest === null || set.updated_timestamp > newest) newest = set.updated_timestamp
    }
    return newest === null ? null : new Date(newest * 1000)
  })

  const percentCounted = computed(() =>
    nationalSet.value?.statistics.percent_voting_places_counted ?? null)
  const votingPlacesCounted = computed(() =>
    nationalSet.value?.statistics.total_voting_places_counted ?? null)
  const votingPlacesTotal = computed(() =>
    nationalSet.value?.statistics.total_voting_places ?? null)
  // The tally's own flag, not the version's. Every archived version carries
  // `is_final` so that it never opens a listener, but a preliminary count is
  // still a preliminary count and must not claim otherwise.
  const isFinal = computed(() => nationalSet.value?.is_final ?? false)

  /* ---------------------------------------------------------------------
   * Archived events: everything from R2, server rendered
   * ------------------------------------------------------------------ */

  const loadKey = computed(() =>
    `election-source-${slugs.value.election}-${slugs.value.version}`)

  // Provenance describes one version. Switching version reuses this component,
  // so it is cleared alongside the payloads it describes.
  watch(loadKey, () => { provenance.value = emptyProvenance() })

  const { status: archiveStatus, refresh } = await useAsyncData(loadKey, async () => {
    const version = resultsVersion.value
    const currentElection = election.value
    if (!version || !currentElection) return false

    // A live event loads client-side from Firestore instead. This also runs
    // when a count ends mid-visit: mode flips to archive and the published
    // snapshot is fetched to replace the feed that just stopped.
    if (mode.value !== 'archive') return false

    error.value = null
    try {
      // Fetched together: they are independent, edge cached, and the page
      // cannot render usefully without all three.
      const urls = {
        persistent: snapshotUrl(version.paths.persistent),
        reference: snapshotUrl(version.paths.reference),
        results: snapshotUrl(version.paths.results),
      }

      const [persistent, reference, results] = await Promise.all([
        $fetch(urls.persistent, apiFetchOptions()),
        $fetch(urls.reference, apiFetchOptions()),
        $fetch(urls.results, apiFetchOptions()),
      ])

      store.setPersistentData(normaliseSnapshotPersistentData(persistent))
      noteLoaded('persistent', 'r2', urls.persistent)
      store.setReferenceData(
        currentElection.slug, version.slug, normaliseSnapshotReferenceData(reference))
      noteLoaded('reference', 'r2', urls.reference)
      store.applyResults(
        currentElection.slug, version.slug, normaliseSnapshotResults(results))
      noteLoaded('results', 'r2', urls.results)
      return true
    } catch (caught) {
      error.value = caught
      // The three are fetched together, so a failure cannot be attributed to
      // one of them. Whichever had not already landed is what did not arrive.
      for (const payload of ['persistent', 'reference', 'results'] as const) {
        if (!provenance.value[payload].origin) noteFailed(payload, caught)
      }
      throw caught
    }
  }, { watch: [loadKey, mode] })

  /* ---------------------------------------------------------------------
   * Live events: persistent from R2, reference where the event document says
   * ------------------------------------------------------------------ */

  /** Persistent data is published long before the night and never changes during it. */
  async function loadLivePersistent() {
    if (!import.meta.client || store.isPersistentLoaded) return
    const version = resultsVersion.value
    if (!version) return

    const url = snapshotUrl(version.paths.persistent)

    try {
      const persistent = await $fetch(url, apiFetchOptions())
      store.setPersistentData(normaliseSnapshotPersistentData(persistent))
      noteLoaded('persistent', 'r2', url)
    } catch (caught) {
      console.warn('[elections] could not load persistent data:', caught)
      error.value = caught
      noteFailed('persistent', caught)
    }
  }

  /** Resolve a published path, which may be absolute or relative to the snapshot base. */
  function referenceUrl(url: string): string {
    return /^https?:\/\//i.test(url) ? url : snapshotUrl(url)
  }

  const hasNames = (data: ReferenceData | null) =>
    Boolean(data && (data.candidates.length || data.parties.length))

  let loadingReference = false

  /**
   * Load reference data once the worker says it exists.
   *
   * Two places name the R2 payload, and both are tried before Firestore is.
   * The event document is preferred because it arrives on the open listener, so
   * a republish mid-count reaches a page that is already open; the manifest is
   * the same map as it stood when the page loaded, which is edge cached and so
   * can be up to its cache lifetime behind. Either is one edge-cached fetch.
   *
   * Reading the ~700 documents out of Firestore is the last resort, and the one
   * piece of redundancy kept here. Reference data is the difference between a
   * dashboard and a page of vote counts labelled "Unknown candidate", and the
   * worker has already written it to Firestore by the time this runs.
   */
  async function loadLiveReference() {
    if (!import.meta.client || loadingReference) return

    const version = resultsVersion.value
    const currentElection = election.value
    const eventDocument = liveEvent.value
    if (!version?.firebase_id || !currentElection) return
    if (!eventDocument?.refdata_built || hasReferenceData.value) return
    // The Firestore path translates ObjectIds back through the persistent index.
    if (!store.persistent) return

    loadingReference = true
    try {
      let data: ReferenceData | null = null
      let origin: PayloadOrigin | null = null
      let url: string | null = null

      // Deduplicated: the two normally agree, and when they do there is no
      // reason to ask the edge for the same object twice.
      const published = [...new Set(
        [eventDocument.paths?.reference, version.paths.reference]
          .filter((path): path is string => Boolean(path)),
      )]

      for (const path of published) {
        url = referenceUrl(path)
        try {
          data = normaliseSnapshotReferenceData(await $fetch(url, apiFetchOptions()))
          origin = 'r2'
          break
        } catch (caught) {
          console.warn('[elections] published reference data unavailable:', url, caught)
          noteFailed('reference', caught)
        }
      }

      if (!hasNames(data)) {
        data = await fetchFirestoreReference(version.firebase_id, store.persistent)
        origin = 'firestore'
        url = null
      }

      if (hasNames(data)) {
        store.setReferenceData(currentElection.slug, version.slug, data!)
        if (origin) noteLoaded('reference', origin, url)
      }
      // Otherwise leave it unloaded: the next change to the event document
      // retries, rather than latching a failure for the life of the page.
    } finally {
      loadingReference = false
    }
  }

  if (import.meta.client) {
    watch([mode, () => resultsVersion.value?.id], () => {
      if (mode.value === 'live') loadLivePersistent()
    }, { immediate: true })

    watch([liveEvent, () => store.isPersistentLoaded, loadKey], () => {
      if (mode.value === 'live') loadLiveReference()
    }, { immediate: true, deep: true })
  }

  /* ---------------------------------------------------------------------
   * The gate
   * ------------------------------------------------------------------ */

  const phase = computed<DashboardPhase>(() => {
    if (!election.value || !resultsVersion.value) return 'loading'

    // Before polls close there is nothing to show, whatever the transport. This
    // is deliberately independent of the live switch, which is normally still
    // off at this point: an election yet to be counted shows its countdown, not
    // an empty archive.
    if (!resultsVersion.value.is_final && !pollsClosed.value) return 'countdown'

    if (mode.value === 'live') {
      if (!store.isPersistentLoaded) return 'loading'
      if (!liveEvent.value?.refdata_built) return 'awaiting-refdata'
      if (!hasReferenceData.value) return 'loading'
      if (!nationalSet.value) return 'awaiting-results'
      return 'ready'
    }

    // Archived. An error here is terminal in a way a live one is not: there is
    // no listener that might still deliver.
    if (archiveStatus.value === 'error') return 'error'
    // Whether the payloads arrived, not whether they held anything. A published
    // version with nothing in it is a finished question, not a pending one, and
    // conflating the two leaves it on a spinner that never resolves.
    if (!store.isPersistentLoaded
      || !store.hasReference(slugs.value.election, slugs.value.version)) return 'loading'
    if (!hasResults.value) return 'awaiting-results'
    return 'ready'
  })

  /* ---------------------------------------------------------------------
   * Voting places, on demand
   * ------------------------------------------------------------------ */

  /**
   * Load voting place results for one electorate, on demand.
   *
   * There are thousands of voting places per general election, so these are
   * never loaded up front and never subscribed to live. They come from the
   * published snapshot in both modes, which during a live count means they are
   * only available once a version has been published with `--voting-places`.
   */
  async function loadVotingPlaces(electorate: EntityNumber) {
    const version = resultsVersion.value
    const currentElection = election.value
    if (!version || !currentElection) return
    if (store.hasVotingPlaceResults(currentElection.slug, version.slug, electorate)) return

    const paths = version.paths.voting_places
    if (!paths) return

    try {
      if (!store.referenceData(currentElection.slug, version.slug)?.voting_places.length) {
        const places = await $fetch(snapshotUrl(paths.reference), apiFetchOptions())
        store.setVotingPlaceReference(
          currentElection.slug, version.slug, normaliseSnapshotVotingPlaces(places))
      }

      const results = await $fetch(
        snapshotUrl(`${paths.by_electorate_base}${electorate}.json`), apiFetchOptions())
      store.applyResults(
        currentElection.slug, version.slug, normaliseSnapshotResults(results))
      store.markVotingPlacesLoaded(currentElection.slug, version.slug, electorate)
    } catch (caught) {
      error.value = caught
    }
  }

  const source: ElectionSource = {
    mode,
    connection,
    liveEnded,
    phase,
    error,
    lastUpdated,
    percentCounted,
    votingPlacesCounted,
    votingPlacesTotal,
    isFinal,
    refresh: async () => { await refresh() },
    loadVotingPlaces,
    watchScope,
    activeScope: readonly(scope) as Readonly<Ref<ResultsScope | null>>,
    liveEvent: computed(() => liveEvent.value),
    provenance: readonly(provenance) as Readonly<Ref<SourceProvenance>>,
  }

  return source
}

/** Read the source provided by the results version page. */
export function useInjectedElectionSource(): ElectionSource | null {
  return inject(ELECTION_SOURCE_KEY, null)
}

/**
 * Declare the electorate-level documents this page needs, for as long as it is open.
 *
 * Firestore bills per document and re-bills every changed document a listener
 * sees, so a subscription that outlives the page that wanted it keeps costing
 * money for data nothing is rendering. Call this synchronously in `setup` and
 * the subscription is released on unmount.
 *
 * Pass a getter to follow a route parameter, and `null` to ask for nothing.
 */
export function useResultsScope(scope: MaybeRefOrGetter<ResultsScope | null>): void {
  const source = useInjectedElectionSource()
  if (!source) return

  const identity = (value: ResultsScope | null) => JSON.stringify(value ?? null)
  let mine: ResultsScope | null = null

  watch(() => toValue(scope), next => {
    mine = next ?? null
    source.watchScope(mine)
  }, { immediate: true })

  // Only release what this page actually asked for. Route transitions can
  // overlap, and the incoming page has usually claimed the scope before the
  // outgoing one tears down.
  onScopeDispose(() => {
    if (identity(source.activeScope.value) === identity(mine)) source.watchScope(null)
  })
}
