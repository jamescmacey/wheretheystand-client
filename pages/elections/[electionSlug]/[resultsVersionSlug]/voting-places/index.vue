<template>
    <ElectionsLayoutDashboardPage
        :title="pageTitle"
        :heading="pageTitle"
        :description="pageDescription"
        :status="false"
        fill
    >
        <!-- InstantSearch cannot be server rendered: hogan.js, which
             instantsearch.js depends on, compiles templates with `new
             Function`, and Cloudflare Workers refuse code generation from
             strings. Mapbox is browser-only as well, so one boundary covers
             both, and the page shell above still renders on the server. -->
        <ClientOnly>
            <template #fallback>
                <UCard variant="subtle">
                    <div class="flex justify-center py-10">
                        <UProgress animation="swing" class="max-w-xs" />
                    </div>
                </UCard>
            </template>

            <ais-instant-search
                :index-name="indexName"
                :search-client="algolia"
                class="flex flex-col flex-1 min-h-0"
            >
                <!--
                  Every search parameter is set here, from state this page owns.

                  There is deliberately no `ais-search-box` or
                  `ais-refinement-list`. Mounting a widget inside another
                  widget's scoped slot makes InstantSearch render, which
                  re-renders the slot, which remounts the widget: a loop that
                  locks the tab up. Driving `ais-configure` from plain refs
                  avoids the nesting entirely, and puts the debounce somewhere
                  obvious.

                  `results_version` is pinned on every request. Without it the
                  same address comes back once per election it was used in,
                  which reads as duplicate data rather than as a bug.
                -->
                <ais-configure v-bind="configureParams" />

                <ais-state-results>
                    <template #default="{ results, status, error }">
                        <ElectionsVotingPlacesState
                            :results="results"
                            :status="status"
                            :error="error"
                            @change="onSearchState"
                        />
                    </template>
                </ais-state-results>

                <!-- Nothing indexed for this version at all: not a search that
                     found nothing, but a version whose places were never
                     synced. Hide the whole apparatus. -->
                <ElectionsResultsEmpty
                    v-if="versionHasNoPlaces"
                    title="Voting places are not available for this results version"
                    description="No voting places have been indexed for this version of the results."
                />

                <div v-else class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                    <div class="lg:w-[24rem] xl:w-[28rem] shrink-0 flex flex-col gap-4 min-h-0">
                        <ElectionsVotingPlacesFinder
                            v-model:query="queryInput"
                            v-model:electorate-name="electorateName"
                            :electorate-names="electorateNames"
                            :location-status="location.status.value"
                            :location-unsupported="location.unsupported.value"
                            :near-me="nearMe"
                            :polling-date="election.polling_date"
                            :is-past="isPast"
                            @request-location="requestLocation"
                            @clear-location="clearLocation"
                        />

                        <!-- Tabs only on a phone, where the panes cannot sit
                             side by side. -->
                        <UTabs
                            v-if="isMobile"
                            v-model="mobilePane"
                            :items="paneItems"
                            :content="false"
                            size="sm"
                        />

                        <div
                            v-show="!isMobile || mobilePane === 'list'"
                            class="flex-1 min-h-0 lg:overflow-y-auto"
                        >
                            <ElectionsVotingPlacesResultList
                                :places="places"
                                :selected-number="selectedNumber"
                                :status="listStatus"
                                :nb-hits="nbHits"
                                :truncated="truncated"
                                :show-distance="nearMe"
                                :has-criteria="hasCriteria"
                                :awaiting-more-typing="awaitingMoreTyping"
                                :unmapped-count="unmappedCount"
                                @select="selectPlace"
                                @refresh="refreshSearch"
                                @clear="clearSearch"
                            />
                        </div>
                    </div>

                    <div
                        v-show="!isMobile || mobilePane === 'map'"
                        class="flex-1 min-h-0 flex flex-col gap-4"
                    >
                        <UAlert
                            v-if="mapError"
                            color="warning"
                            variant="subtle"
                            icon="i-lucide-triangle-alert"
                            title="The map could not be loaded"
                            :description="mapError"
                        />
                        <!-- v-show, never v-if: tearing the map down and
                             rebuilding it on every tab switch leaks a WebGL
                             context each time. -->
                        <div
                            v-show="!mapError"
                            class="flex-1 min-h-[20rem]"
                            :class="isMobile ? 'h-[60svh]' : ''"
                        >
                            <ElectionsVotingPlacesMap
                                :map-id="mapId"
                                :places="mappedPlaces"
                                :selected-number="selectedNumber"
                                :focus-number="focusNumber"
                                :fit-key="fitKey"
                                :user-location="location.coords.value"
                                :empty-hint="mapEmptyHint"
                                @select="selectPlace"
                                @error="mapError = $event"
                            />
                        </div>

                        <ElectionsVotingPlacesDetail
                            v-if="selectedPlace && !isMobile"
                            :election="election"
                            :results-version="resultsVersion"
                            :place="selectedPlace"
                            :show-distance="nearMe"
                            class="shrink-0 max-h-[45%] overflow-y-auto"
                            @close="selectedNumber = null"
                        />
                    </div>
                </div>

                <!-- On a phone the detail is a drawer: there is no room for a
                     third pane, and it has to be reachable from either tab. -->
                <UDrawer
                    v-if="isMobile"
                    :open="Boolean(selectedPlace)"
                    @update:open="onDrawerToggle"
                >
                    <template #content>
                        <div class="p-4">
                            <ElectionsVotingPlacesDetail
                                v-if="selectedPlace"
                                :election="election"
                                :results-version="resultsVersion"
                                :place="selectedPlace"
                                :show-distance="nearMe"
                                @close="selectedNumber = null"
                            />
                        </div>
                    </template>
                </UDrawer>
            </ais-instant-search>
        </ClientOnly>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import { AisConfigure, AisInstantSearch, AisStateResults } from 'vue-instantsearch/vue3/es'
import { breakpointsTailwind, useBreakpoints, watchDebounced } from '@vueuse/core'
import type { ElectionSummary, ResultsVersion, VotingPlaceHit } from '~/types/elections'
import type { SearchStatePayload } from '~/components/elections/voting-places/State.vue'
import { formatCount } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

/** Shortest text query worth a request. Mirrored in the list's copy. */
const MIN_QUERY_LENGTH = 3

/** What one request returns. Enough for the largest electorate in full. */
const HITS_PER_PAGE = 200

const indexName = useAlgoliaIndexName('ElectionVotingPlaces')
const algolia = useNuxtApp().$algolia

const breakpoints = useBreakpoints(breakpointsTailwind)
const isLarge = breakpoints.greaterOrEqual('lg')
const isMobile = computed(() => !isLarge.value)

const mobilePane = ref<'list' | 'map'>('list')
const paneItems = [
    { label: 'List', value: 'list', icon: 'i-lucide-list' },
    { label: 'Map', value: 'map', icon: 'i-lucide-map' },
]

/* ------------------------------------------------------------------ *
 * What the reader has asked for, and the URL that carries it
 * ------------------------------------------------------------------ */

const route = useRoute()
const router = useRouter()

/** What is in the box right now: bound to the input, so typing never lags. */
const queryInput = ref(typeof route.query.q === 'string' ? route.query.q : '')

/** What has actually been searched. The debounce lives between the two. */
const appliedQuery = ref(queryInput.value)

const electorateName = ref<string | null>(
    typeof route.query.electorate === 'string' ? route.query.electorate : null,
)

/**
 * One request per pause in typing, not one per keystroke.
 *
 * Below the minimum length nothing is applied at all rather than applied later:
 * one- and two-character fragments match a large share of the index and tell
 * the reader nothing. Clearing the box back to empty does search, since that is
 * how somebody undoes a query.
 */
watchDebounced(queryInput, (value) => {
    if (value.length > 0 && value.length < MIN_QUERY_LENGTH) return
    appliedQuery.value = value
}, { debounce: 300 })

/** A shareable URL, kept to what was actually searched. */
watch([appliedQuery, electorateName], ([query, electorate]) => {
    const next = { ...route.query }
    if (query) next.q = query
    else delete next.q
    if (electorate) next.electorate = electorate
    else delete next.electorate

    // Replace, not push: typing an address should not fill the back button.
    router.replace({ query: next })
})

/* ------------------------------------------------------------------ *
 * Location
 * ------------------------------------------------------------------ */

const location = useUserLocation()
const nearMe = computed(() => location.status.value === 'granted' && Boolean(location.coords.value))

async function requestLocation() {
    await location.request()
}

function clearLocation() {
    location.clear()
}

/* ------------------------------------------------------------------ *
 * Search parameters
 * ------------------------------------------------------------------ */

const versionFilter = computed(() => `results_version:"${props.resultsVersion.id}"`)

const configureParams = computed(() => {
    const params: Record<string, unknown> = {
        filters: versionFilter.value,
        hitsPerPage: HITS_PER_PAGE,
        query: appliedQuery.value,
    }

    if (electorateName.value) {
        params.facetFilters = [[`electorate_name:${electorateName.value}`]]
    }

    const coords = location.coords.value
    if (coords) {
        params.aroundLatLng = `${coords.lat},${coords.lng}`
        // 'all' rather than a radius: it ranks the whole version by distance,
        // so there is never a "nothing within 10 km" dead end, and the
        // distance on each result says how far it really is.
        params.aroundRadius = 'all'
        // The distance shown comes from Algolia's own ranking info, so the
        // figure cannot disagree with the order results arrived in.
        params.getRankingInfo = true
    }

    return params
})

/* ------------------------------------------------------------------ *
 * The electorate list, and whether this version has anything at all
 * ------------------------------------------------------------------ */

/**
 * Asked once per results version, unfiltered.
 *
 * It has to be its own request. Facet counts collapse to the chosen value once
 * a facet filter is applied, so reading the electorate list off the main search
 * would leave the chooser with one option in it the moment somebody used it.
 * The same response says whether this version has any voting places indexed,
 * which is otherwise indistinguishable from a search that matched nothing.
 */
const { data: facetData } = await useAsyncData(
    () => `voting-place-facets-${props.resultsVersion.id}`,
    () => algolia.initIndex(indexName).search('', {
        filters: versionFilter.value,
        hitsPerPage: 0,
        facets: ['electorate_name'],
        maxValuesPerFacet: 200,
    }),
    { watch: [versionFilter], server: false },
)

const electorateNames = computed(() => (
    Object.keys(facetData.value?.facets?.electorate_name ?? {})
        .sort((a, b) => a.localeCompare(b, 'en-NZ'))
))

const versionHasNoPlaces = computed(() => facetData.value?.nbHits === 0)

/* ------------------------------------------------------------------ *
 * Results, lifted out of ais-state-results
 * ------------------------------------------------------------------ */

const searchState = ref<SearchStatePayload | null>(null)

function onSearchState(payload: SearchStatePayload) {
    searchState.value = payload
}

const nbHits = computed(() => searchState.value?.nbHits ?? 0)

const hasCriteria = computed(() => (
    queryInput.value.length > 0 || Boolean(electorateName.value) || nearMe.value
))

const awaitingMoreTyping = computed(() => (
    queryInput.value.length > 0 && queryInput.value.length < MIN_QUERY_LENGTH
))

/**
 * The hits, held back until something has been asked for.
 *
 * An empty query still returns a page of results, and listing an arbitrary two
 * hundred of several thousand places would be a list of nothing in particular.
 */
const places = computed<VotingPlaceHit[]>(() => {
    if (!hasCriteria.value) return []

    return (searchState.value?.hits ?? []).map((hit) => {
        const ranking = hit._rankingInfo as { geoDistance?: number } | undefined
        return {
            ...(hit as unknown as VotingPlaceHit),
            distanceMetres: typeof ranking?.geoDistance === 'number' ? ranking.geoDistance : null,
        }
    })
})

/** Only these can be drawn; the rest are listed and badged instead. */
const mappedPlaces = computed(() => places.value.filter(place => Boolean(place._geoloc)))
const unmappedCount = computed(() => places.value.length - mappedPlaces.value.length)

const truncated = computed(() => hasCriteria.value && nbHits.value > places.value.length)

const listStatus = computed<'idle' | 'pending' | 'success' | 'error'>(() => {
    const status = searchState.value?.status
    if (!searchState.value) return 'pending'
    if (status === 'error') return 'error'
    if (status === 'loading' || status === 'stalled') return 'pending'
    return 'success'
})

/* ------------------------------------------------------------------ *
 * Selection and the map camera
 * ------------------------------------------------------------------ */

const selectedNumber = ref<number | null>(null)
const focusNumber = ref<number | null>(null)
const mapError = ref('')

const selectedPlace = computed(() => (
    places.value.find(place => place.number === selectedNumber.value) ?? null
))

function selectPlace(number: number) {
    selectedNumber.value = number
    // Cleared first so that re-selecting the same place still pans to it.
    focusNumber.value = null
    nextTick(() => { focusNumber.value = number })
}

function onDrawerToggle(open: boolean) {
    if (!open) selectedNumber.value = null
}

const mapId = computed(() => `voting-places-${props.resultsVersion.id}`)

/**
 * Changes only when the set of places on the map changes, so the camera is
 * refitted then and not on every re-render. A reader who has panned somewhere
 * keeps their view until the results themselves change.
 */
const fitKey = computed(() => (
    `${mappedPlaces.value.length}:${mappedPlaces.value.map(place => place.number).join(',')}`
))

const mapEmptyHint = computed(() => {
    if (!hasCriteria.value) return 'Choose an electorate or search an address to see voting places.'
    if (places.value.length > 0 && unmappedCount.value === places.value.length) {
        return `None of these ${formatCount(places.value.length)} voting places has a mapped location.`
    }
    return 'No voting places to show on the map.'
})

/** Re-run the current search, after a request that failed. */
function refreshSearch() {
    searchState.value = null
    const current = appliedQuery.value
    appliedQuery.value = `${current} `
    nextTick(() => { appliedQuery.value = current })
}

function clearSearch() {
    selectedNumber.value = null
    queryInput.value = ''
    appliedQuery.value = ''
    electorateName.value = null
    location.clear()
}

/* ------------------------------------------------------------------ *
 * Framing
 * ------------------------------------------------------------------ */

const isPast = computed(() => {
    if (!props.election.polling_date) return false
    const polling = new Date(props.election.polling_date)
    polling.setHours(23, 59, 59, 999)
    return polling.getTime() < Date.now()
})

/**
 * This page is a way into results, not a guide to finding a booth.
 *
 * The distinction is not cosmetic. The dashboard renders a child page only
 * once the count is ready, so somebody wanting to know where to vote can never
 * reach this; titling it "Where to vote" would promise wayfinding the page is
 * not for and, by the time anyone sees it, could not give anyway.
 */
const pageTitle = 'Voting places'

const pageDescription = computed(() => (
    `Voting places used at the ${props.election.name}. Search by address, or choose an electorate.`
))

usePageSeo({
    title: `${pageTitle} — ${props.election.name}`,
    description: pageDescription.value,
})
</script>
