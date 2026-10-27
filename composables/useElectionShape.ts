import type { ElectionManifest, ElectionSummary, ReferenceElectorate } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * What kind of election this is, and so what the dashboard should offer.
 *
 * A by-election has no party vote: no list seats, no seat allocation, no
 * Parliament to draw. Half the dashboard is meaningless for one, and the
 * alternative to a single answer here is `election_type === 'by-election'`
 * repeated across the nav, the pages and half a dozen components -- where it
 * will eventually be forgotten in one of them.
 *
 * Resolved from the route rather than from props, so the layout and the pages
 * inside it reach the same answer. The layout is the parent, so it cannot
 * inject anything a page provides.
 *
 * Two signals, because neither is sufficient on its own. `election_type` is
 * known before any results arrive, which is what the countdown needs, but it is
 * data entry and can be wrong -- the published manifest currently types the
 * 2025 Tāmaki Makaurau by-election as `general`. One electorate in the
 * reference data is conclusive but arrives later. Either one is enough.
 *
 * Only the manifest's answer is used until the page has mounted. Reference data
 * lives in the store, which is not reliably populated while the layout renders
 * on the server, so letting it decide produced a navigation whose items differed
 * between the server's markup and the browser's -- a hydration mismatch, and one
 * that showed up as a nav item appearing and vanishing. Refining afterwards
 * costs a correctly typed election nothing, because both signals already agree.
 */
export function useElectionShape() {
  const route = useRoute()
  const store = useElectionDataStore()

  const electionSlug = computed(() => String(route.params.electionSlug ?? ''))
  const versionSlug = computed(() => String(route.params.resultsVersionSlug ?? ''))

  // Read from the cache rather than fetching: the manifest is already loaded by
  // whichever page is inside this layout, under this key.
  const manifest = useNuxtData<ElectionManifest>('elections-manifest')

  const election = computed<ElectionSummary | null>(() =>
    manifest.data.value?.elections.find(item => item.slug === electionSlug.value) ?? null)

  const resultsVersion = computed(() => {
    const versions = election.value?.results_versions ?? []
    if (!versions.length) return null
    if (versionSlug.value === 'default') {
      return versions.find(version => version.is_primary) ?? versions[0] ?? null
    }
    return versions.find(version => version.slug === versionSlug.value) ?? null
  })

  // The server renders the layout without waiting for this, so it must not
  // reach any value that decides what is rendered until the browser has taken
  // over. See the note above.
  const settled = ref(false)
  onMounted(() => { settled.value = true })

  const electorates = computed<ReferenceElectorate[]>(() => {
    const version = resultsVersion.value
    if (!version || !settled.value) return []
    return store.referenceData(electionSlug.value, version.slug)?.electorates ?? []
  })

  /** Null until reference data has arrived; not zero, which would read as none. */
  const electorateCount = computed<number | null>(() =>
    (electorates.value.length ? electorates.value.length : null))

  const isByElection = computed(() =>
    election.value?.election_type === 'by-election' || electorateCount.value === 1)

  const isSingleElectorate = computed(() =>
    electorateCount.value === 1 || (electorateCount.value === null && isByElection.value))

  const soleElectorate = computed<ReferenceElectorate | null>(() =>
    (electorates.value.length === 1 ? electorates.value[0]! : null))

  const hasPartyVote = computed(() => !isByElection.value)

  return {
    election,
    resultsVersion,
    electorateCount,
    isByElection,
    isSingleElectorate,
    soleElectorate,
    hasPartyVote,
  }
}
