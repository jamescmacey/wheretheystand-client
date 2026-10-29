<template>
    <ClientOnly>
        <!-- MapboxMap renders an absolutely positioned div, and each child
             source and layer renders a stray div of its own, so the height has
             to live on a relative wrapper here rather than on the map. -->
        <div class="relative w-full h-full overflow-hidden rounded-md ring ring-default">
            <MapboxMap
                :key="mapId"
                :map-id="mapId"
                class="w-full h-full"
                :options="mapOptions"
                @error="onMapError"
            >
                <MapboxSource :source-id="sourceId" :source="mapSource" />

                <MapboxLayer :layer="clusterLayer" :on-click="onClusterClick" />
                <MapboxLayer :layer="clusterCountLayer" />
                <MapboxLayer
                    :layer="placesLayer"
                    :on-click="onPlaceClick"
                    :on-mouseenter="onPlaceEnter"
                    :on-mouseleave="onPlaceLeave"
                />
                <MapboxLayer :layer="selectedLayer" />

                <MapboxDefaultMarker
                    v-if="userLocation"
                    :marker-id="`${mapId}-you`"
                    :lnglat="[userLocation.lng, userLocation.lat]"
                    :options="{ color: '#58787f' }"
                />
            </MapboxMap>

            <div
                v-if="!places.length"
                class="absolute inset-x-0 bottom-0 p-3 text-center text-sm text-muted bg-default/80 backdrop-blur-sm"
            >
                {{ emptyHint }}
            </div>
        </div>

        <template #fallback>
            <div class="w-full h-full flex items-center justify-center rounded-md ring ring-default">
                <UProgress animation="swing" class="max-w-xs" />
            </div>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
import type { GeoJSONSource } from 'mapbox-gl'
import type { VotingPlaceHit } from '~/types/elections'
import {
    NZ_FALLBACK_CENTRE,
    NZ_FALLBACK_ZOOM,
    NZ_MAX_BOUNDS,
    boundsFromCoordinates,
} from '~/utils/geo/geojson'

const props = defineProps<{
    /** Only places with coordinates. The rest cannot be drawn. */
    mapId: string
    places: VotingPlaceHit[]
    selectedNumber: number | null
    /** Pan to this place when it changes, without refitting the whole view. */
    focusNumber: number | null
    /**
     * Changes when the result set changes. The map refits only on this, so a
     * reordering or a re-render does not yank the camera from under a reader
     * who has panned somewhere themselves.
     */
    fitKey: string
    userLocation: { lat: number, lng: number } | null
    emptyHint: string
}>()

const emit = defineEmits<{ select: [number], error: [string] }>()

const sourceId = computed(() => `${props.mapId}-places`)

const mapOptions = {
    style: 'mapbox://styles/mapbox/light-v11',
    renderWorldCopies: false,
    center: NZ_FALLBACK_CENTRE,
    zoom: NZ_FALLBACK_ZOOM,
    // Create-only in this module, so it is set once to the whole country
    // rather than tracked to the result set. Longitudes run past 180 so the
    // box reaches the Chathams without wrapping the long way round.
    maxBounds: NZ_MAX_BOUNDS,
}

const featureCollection = computed<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: props.places.map(place => ({
        type: 'Feature' as const,
        // Only what the layers filter and label on; the full record already
        // lives in the list, keyed by the same number.
        properties: { number: place.number },
        geometry: {
            type: 'Point' as const,
            coordinates: [place._geoloc!.lng, place._geoloc!.lat],
        },
    })),
}))

/**
 * A fresh object each time, because the module watches `source` by identity
 * and calls `setData` -- a mutated object in place would never be noticed.
 *
 * Clustering is configured once here and cannot be changed later, for the same
 * reason: the source is added on mount and only ever has its data replaced.
 * `clusterMinPoints` is what makes that single setting work for both cases --
 * one electorate's forty places never cluster, a whole country's do.
 */
const mapSource = computed(() => ({
    type: 'geojson' as const,
    data: featureCollection.value,
    cluster: true,
    clusterRadius: 48,
    clusterMaxZoom: 11,
    clusterMinPoints: 20,
    // Required for the hover feature state below: GeoJSON features have no id
    // of their own, and `setFeatureState` silently does nothing without one.
    generateId: true,
}))

// Layer objects are computed on ids alone, so their identity is stable while
// the map lives. The module deep-watches each layer and re-applies every paint
// property on any change, which would otherwise run on each keystroke.
const placesLayer = computed(() => ({
    id: `${props.mapId}-place`,
    type: 'circle' as const,
    source: sourceId.value,
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 8, 6],
        'circle-color': '#349494',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
    },
}))

/**
 * The selected place, drawn over the top.
 *
 * With nothing selected the filter matches nothing rather than being removed:
 * the module only calls `setFilter` when the new filter is truthy, so dropping
 * it would leave the previous selection highlighted for good.
 */
const selectedLayer = computed(() => ({
    id: `${props.mapId}-place-selected`,
    type: 'circle' as const,
    source: sourceId.value,
    filter: ['all',
        ['!', ['has', 'point_count']],
        ['==', ['get', 'number'], props.selectedNumber ?? -1],
    ],
    paint: {
        'circle-radius': 10,
        'circle-color': '#58787f',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
    },
}))

const clusterLayer = computed(() => ({
    id: `${props.mapId}-cluster`,
    type: 'circle' as const,
    source: sourceId.value,
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': '#349494',
        'circle-opacity': 0.85,
        'circle-radius': ['step', ['get', 'point_count'], 16, 50, 22, 200, 30],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
    },
}))

const clusterCountLayer = computed(() => ({
    id: `${props.mapId}-cluster-count`,
    type: 'symbol' as const,
    source: sourceId.value,
    filter: ['has', 'point_count'],
    layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12,
    },
    paint: { 'text-color': '#ffffff' },
}))

const mapRef = useMapboxRef(props.mapId)

type LayerMouseEvent = {
    features?: Array<{ id?: number | string, properties?: Record<string, unknown> }>
    lngLat?: { lng: number, lat: number }
}

function onPlaceClick(event: LayerMouseEvent) {
    const number = event.features?.[0]?.properties?.number
    if (typeof number === 'number') {
        emit('select', number)
    }
}

/** Hover is feature state rather than a re-render, so panning stays smooth. */
let hoveredId: number | string | undefined

function onPlaceEnter(event: LayerMouseEvent) {
    const map = mapRef.value
    if (!map) return
    map.getCanvas().style.cursor = 'pointer'

    const id = event.features?.[0]?.id
    if (id === undefined) return
    hoveredId = id
    map.setFeatureState({ source: sourceId.value, id }, { hover: true })
}

function onPlaceLeave() {
    const map = mapRef.value
    if (!map) return
    map.getCanvas().style.cursor = ''

    if (hoveredId !== undefined) {
        map.setFeatureState({ source: sourceId.value, id: hoveredId }, { hover: false })
        hoveredId = undefined
    }
}

/** Clicking a cluster zooms to where it breaks apart. */
function onClusterClick(event: LayerMouseEvent) {
    const map = mapRef.value
    // The cluster's own id, which is a property rather than the feature id.
    const clusterId = event.features?.[0]?.properties?.cluster_id
    if (!map || clusterId === undefined || !event.lngLat) return

    const source = map.getSource(sourceId.value) as GeoJSONSource | undefined
    if (!source?.getClusterExpansionZoom) return

    const { lng, lat } = event.lngLat

    source.getClusterExpansionZoom(Number(clusterId), (error, zoom) => {
        if (error || zoom === null || zoom === undefined) return
        map.easeTo({ center: [lng, lat], zoom, duration: 400 })
    })
}

function onMapError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? '')
    emit('error', message || 'The map could not be loaded.')
}

/**
 * Refit when the result set changes.
 *
 * Done imperatively rather than through `options.bounds`: the module's options
 * watcher calls `fitBounds` with no padding and no `maxZoom`, which on a single
 * result zooms to street level and clips the marker against the edge.
 */
watch(() => props.fitKey, () => {
    const map = mapRef.value
    if (!map) return

    const coords = props.places
        .map(place => [place._geoloc!.lng, place._geoloc!.lat] as [number, number])

    if (!coords.length) {
        map.easeTo({ center: NZ_FALLBACK_CENTRE, zoom: NZ_FALLBACK_ZOOM, duration: 400 })
        return
    }

    const bounds = boundsFromCoordinates(coords)
    if (!bounds) return

    map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 400 })
})

/** Selecting from the list pans to the place without refitting. */
watch(() => props.focusNumber, (number) => {
    const map = mapRef.value
    if (!map || number === null) return

    const place = props.places.find(candidate => candidate.number === number)
    if (!place?._geoloc) return

    map.easeTo({
        center: [place._geoloc.lng, place._geoloc.lat],
        zoom: Math.max(map.getZoom(), 13),
        duration: 400,
    })
})

/**
 * Give the WebGL context back.
 *
 * The module's own teardown only forgets the instance -- it never calls
 * `remove()` -- and because it turns on `keepalive` app wide, maps accumulate.
 * Browsers allow somewhere between eight and sixteen live contexts, after which
 * the oldest is dropped and that map goes blank.
 *
 * Both halves of this are load bearing. The instance is captured while it
 * exists, because the module deletes it from its registry in the child's own
 * teardown, leaving nothing to call `remove()` on. And `remove()` is called in
 * `onUnmounted` rather than `onBeforeUnmount`, because children unmount in
 * between: destroying the map first leaves `MapboxSource` calling
 * `removeSource` on a map whose style has already gone, which throws.
 */
let mapInstance: ReturnType<typeof useMapboxRef>['value']

watch(mapRef, (map) => {
    if (map) mapInstance = map
}, { immediate: true })

onUnmounted(() => {
    mapInstance?.remove()
    mapInstance = undefined
})
</script>
