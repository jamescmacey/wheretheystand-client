<template>
    <div class="flex flex-col gap-2">
        <!-- Nothing drawable, said out loud rather than left as a blank
             column: a reader who sees no map should be told that none is held,
             not left wondering whether one failed to appear. -->
        <UAlert v-if="!shape" color="neutral" variant="subtle" icon="i-lucide-map-off"
            title="Boundary not held"
            :description="`No boundary is held for this electorate as it stood at the ${election.name}.`" />

        <UAlert v-else-if="mapError" color="warning" variant="subtle" icon="i-lucide-triangle-alert"
            title="The map could not be loaded" :description="mapError" />

        <template v-else>
            <!-- The height lives on this wrapper, not on MapboxMap: the map
                 renders an absolutely positioned div, and each source and layer
                 renders a stray div of its own. -->
            <div class="h-72 lg:h-96">
                <ClientOnly>
                    <div class="relative w-full h-full overflow-hidden rounded-md ring ring-default">
                        <MapboxMap :key="mapId" :map-id="mapId" class="w-full h-full"
                            :options="mapOptions" @error="onMapError">
                            <template v-if="geojson">
                                <MapboxSource :source-id="sourceId" :source="mapSource" />
                                <MapboxLayer :layer="fillLayer" />
                                <MapboxLayer :layer="outlineLayer" />
                            </template>
                            <!-- Always mounted, so pins added mid-count reach a
                                 source that already exists rather than racing
                                 the map's style load. -->
                            <MapboxSource :source-id="placesSourceId" :source="placesSource" />
                            <MapboxLayer :layer="placesLayer" />
                            <MapboxNavigationControl :options="{ showCompass: false }" />
                        </MapboxMap>

                        <div v-if="hoveredPlace"
                            class="absolute top-2 left-2 right-2 rounded-md bg-default/90 backdrop-blur-sm ring ring-default px-3 py-2 text-sm pointer-events-none">
                            <p class="font-medium text-highlighted">{{ hoveredPlace.address }}</p>
                            <p v-if="hoveredPlace.away" class="text-muted">Elsewhere, issuing votes for this electorate</p>
                        </div>

                        <div v-if="status === 'pending'"
                            class="absolute inset-x-0 bottom-0 p-3 text-center text-sm text-muted bg-default/80 backdrop-blur-sm">
                            Loading the boundary…
                        </div>
                    </div>

                    <template #fallback>
                        <div class="w-full h-full flex items-center justify-center rounded-md ring ring-default">
                            <UProgress animation="swing" class="max-w-xs" />
                        </div>
                    </template>
                </ClientOnly>
            </div>

            <!-- Said beside the map rather than left to be assumed: a reader
                 has no way to tell one review's coastline from another's. -->
            <p v-if="unplaced" class="text-xs text-muted">{{ unplaced }}</p>
            <p v-if="laterBoundaryNote" class="text-xs text-muted">{{ laterBoundaryNote }}</p>
            <p v-if="attribution" class="text-xs text-muted">{{ attribution }}</p>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { MapMouseEvent } from 'mapbox-gl'
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { ElectorateVotingPlace } from '~/composables/useElectorateVotingPlaces'
import { useElectionDataStore } from '~/stores/electionData'
import { chooseElectorateBoundary } from '~/utils/elections/boundaries'
import { formatIsoDate } from '~/utils/elections/format'
import {
    NZ_FALLBACK_CENTRE,
    NZ_FALLBACK_ZOOM,
    NZ_MAX_BOUNDS,
    boundsFromGeoJson,
    normaliseGeoJson,
} from '~/utils/geo/geojson'

/**
 * One electorate's boundary, as it stood at this election.
 *
 * The shape comes from the persistent payload rather than the API: a boundary
 * belongs to the seat rather than to one election, which is why it survives
 * across them, and `chooseElectorateBoundary` is where the choice between an
 * electorate's several sets is made and explained.
 *
 * Mounted under a `:key` of the electorate, because the camera, the source and
 * the WebGL context all belong to one shape.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
    mapId: string
    /** The places that issued this seat's ballots. Those without coordinates are counted, not drawn. */
    places?: ElectorateVotingPlace[]
}>()

const store = useElectionDataStore()

const persistent = computed(() =>
    store.persistentElectorateFor(props.election.slug, props.resultsVersion.slug, props.electorate))

const chosen = computed(() =>
    chooseElectorateBoundary(persistent.value?.boundaries ?? [], props.election.polling_date))

const shape = computed(() => chosen.value?.shape ?? null)

/**
 * Where the lines drawn are not the lines this election was fought on.
 *
 * `chooseElectorateBoundary` falls back to the next review rather than leaving
 * seven seats without a map, which is only defensible if the page says which
 * review a reader is looking at.
 */
const laterBoundaryNote = computed(() => {
    if (!chosen.value || chosen.value.inForce) return ''
    const came = formatIsoDate(chosen.value.boundary.valid_from)
    return came
        ? `These boundaries came into force on ${came}, after this election. `
            + 'The boundaries used at the election are not held.'
        : 'These boundaries came into force after this election. '
            + 'The boundaries used at the election are not held.'
})

/**
 * Fetched in the browser only.
 *
 * The map cannot render on the server, so a boundary fetched there is a
 * megabyte nobody looks at, paid for inside the page's own render.
 */
const { data: payload, status } = useAsyncData<unknown>(
    () => `electorate-boundary-${props.resultsVersion.id}-${props.electorate}`,
    async () => {
        const url = shape.value?.url
        if (!url) return null
        return await $fetch<unknown>(url, apiFetchOptions({ responseType: 'json' }))
    },
    { watch: [shape], server: false },
)

const geojson = computed(() => normaliseGeoJson(payload.value))

const mapError = ref('')

// A file that fetched but will not parse is the same dead end to a reader as one
// that would not load, so it is reported the same way.
watch([status, payload, geojson], ([state, loaded, parsed]) => {
    if (state === 'error') {
        mapError.value = 'The boundary file could not be loaded.'
        return
    }
    if (state === 'success' && loaded && !parsed) {
        mapError.value = 'The boundary file was loaded but is not valid GeoJSON.'
        return
    }
    mapError.value = ''
})

const sourceId = computed(() => `${props.mapId}-boundary`)

/** A fresh object each time: the module watches `source` by identity. */
const mapSource = computed(() => ({ type: 'geojson' as const, data: geojson.value }))

const fillLayer = computed(() => ({
    id: `${props.mapId}-fill`,
    type: 'fill' as const,
    source: sourceId.value,
    paint: { 'fill-color': '#349494', 'fill-opacity': 0.12 },
}))

const outlineLayer = computed(() => ({
    id: `${props.mapId}-outline`,
    type: 'line' as const,
    source: sourceId.value,
    paint: { 'line-color': '#349494', 'line-width': 2 },
}))

/**
 * Created looking at the country, then fitted to the shape below.
 *
 * Not `options.bounds`, which the module only honours by calling `fitBounds`
 * with no padding when the options object changes -- and the shape arrives
 * after the map, so that is exactly when it would run.
 */
const mapOptions = {
    style: 'mapbox://styles/mapbox/light-v11',
    renderWorldCopies: false,
    center: NZ_FALLBACK_CENTRE,
    zoom: NZ_FALLBACK_ZOOM,
    // Create-only, so it is the whole country: longitudes run past 180 so the
    // box reaches the Chathams without wrapping the long way round.
    maxBounds: NZ_MAX_BOUNDS,
}

const mapRef = useMapboxRef(props.mapId)

/* ------------------------------------------------------------------ *
 * Voting places
 * ------------------------------------------------------------------ */

const drawable = computed(() => (props.places ?? [])
    .filter(place => place.latitude !== null && place.longitude !== null))

/**
 * Said under the map, because a list of sixty beside a map of fifty-eight
 * otherwise looks like two pins went missing.
 */
const unplaced = computed(() => {
    const missing = (props.places?.length ?? 0) - drawable.value.length
    if (missing <= 0) return ''
    return missing === 1
        ? 'One voting place has no location recorded and is not on the map.'
        : `${missing} voting places have no location recorded and are not on the map.`
})

const placesSourceId = computed(() => `${props.mapId}-places`)

/** A fresh object each time: the module watches `source` by identity. */
const placesSource = computed(() => ({
    type: 'geojson' as const,
    data: {
        type: 'FeatureCollection' as const,
        features: drawable.value.map(place => ({
            type: 'Feature' as const,
            properties: { number: place.number, away: place.away },
            geometry: {
                type: 'Point' as const,
                coordinates: [place.longitude!, place.latitude!],
            },
        })),
    },
}))

/**
 * The seat's own places in its colour, those elsewhere muted: at a general
 * election the advance places across the country are most of the list and
 * almost none of the votes.
 *
 * Fitted to the boundary, not to the pins, for the same reason -- a fit that
 * took in every advance place would show the whole country every time.
 */
const placesLayer = computed(() => ({
    id: `${props.mapId}-places`,
    type: 'circle' as const,
    source: placesSourceId.value,
    paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 12, 6],
        'circle-color': ['case', ['get', 'away'], '#94a3b8', '#349494'],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
    },
}))

const hoveredPlace = ref<ElectorateVotingPlace | null>(null)

function placeFor(event: MapMouseEvent) {
    const number = event.features?.[0]?.properties?.number
    return typeof number === 'number'
        ? drawable.value.find(place => place.number === number) ?? null
        : null
}

function onPlaceClick(event: MapMouseEvent) {
    const place = placeFor(event)
    if (place) navigateTo(place.to)
}

function onPlaceMove(event: MapMouseEvent) {
    const map = mapRef.value
    if (map) map.getCanvas().style.cursor = 'pointer'
    hoveredPlace.value = placeFor(event)
}

function onPlaceLeave() {
    const map = mapRef.value
    if (map) map.getCanvas().style.cursor = ''
    hoveredPlace.value = null
}

function onMapError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? '')
    mapError.value = message || 'The map could not be loaded.'
}

/**
 * Framed once per map and shape.
 *
 * The module re-triggers `mapRef` on Mapbox's `data` and `idle` events, so
 * without this check the camera snaps back whenever a reader moves it.
 */
let framedMap: unknown
let framedShape: unknown

watch([mapRef, geojson], ([map, shapeJson]) => {
    if (!map || !shapeJson) return
    if (map === framedMap && shapeJson === framedShape) return
    const bounds = boundsFromGeoJson(shapeJson)
    if (!bounds) return
    framedMap = map
    framedShape = shapeJson
    map.fitBounds(bounds, { padding: 24, duration: 0 })
}, { immediate: true })

/**
 * What the licence asks to be shown wherever the shape is drawn.
 *
 * Two sentences, each dropped where the record does not hold its parts: a
 * shape with no grantor is still licensed, and one with no licence recorded
 * still has an owner to credit.
 */
const attribution = computed(() => {
    const file = shape.value
    if (!file) return ''

    const owner = file.copyright_owner ? `Boundary: ${file.copyright_owner}.` : null

    let use: string | null = null
    if (file.licence && file.licence_grantor) {
        use = `Used under a ${file.licence} licence granted by ${file.licence_grantor}.`
    }
    else if (file.licence) {
        use = `Used under a ${file.licence} licence.`
    }
    else if (file.licence_grantor) {
        use = `Used under a licence granted by ${file.licence_grantor}.`
    }

    return [owner, use].filter(Boolean).join(' ')
})

/**
 * Give the WebGL context back.
 *
 * Load bearing, for the reasons set out on the voting places map: the module
 * never calls `remove()` itself and turns on `keepalive` app wide, so maps
 * accumulate until the browser drops the oldest context and that map goes
 * blank. The instance is captured while it exists, and released in
 * `onUnmounted` rather than before, because the source and layers unmount in
 * between and need a map whose style is still there.
 */
let mapInstance: ReturnType<typeof useMapboxRef>['value']

// Pointer handlers are bound on the map rather than through MapboxLayer's
// props, which never reach it -- as on the voting places map. Layer-scoped
// listeners may be bound before the layer exists.
watch(mapRef, (map) => {
    if (!map || map === mapInstance) return
    mapInstance = map
    const layerId = placesLayer.value.id
    map.on('click', layerId, onPlaceClick)
    map.on('mousemove', layerId, onPlaceMove)
    map.on('mouseleave', layerId, onPlaceLeave)
}, { immediate: true })

onUnmounted(() => {
    mapInstance?.remove()
    mapInstance = undefined
})
</script>
