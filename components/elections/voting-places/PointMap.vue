<template>
    <div class="w-full h-full">
        <UAlert v-if="!coordinates" color="neutral" variant="subtle" icon="i-lucide-map-pin-off"
            title="Location not mapped"
            description="This voting place has no recorded coordinates, so it cannot be shown on a map." />

        <ClientOnly v-else>
            <!-- The height lives on this wrapper, not on MapboxMap: the map
                 renders an absolutely positioned div, and each child renders a
                 stray div of its own. -->
            <div class="relative w-full h-full overflow-hidden rounded-md ring ring-default">
                <MapboxMap :key="mapId" :map-id="mapId" class="w-full h-full" :options="mapOptions"
                    @error="onMapError" />
            </div>

            <template #fallback>
                <div class="w-full h-full flex items-center justify-center rounded-md ring ring-default">
                    <UProgress animation="swing" class="max-w-xs" />
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { NZ_MAX_BOUNDS } from '~/utils/geo/geojson'

/**
 * One voting place on a map.
 *
 * Separate from the finder's map rather than that map given a single place:
 * this needs no clustering, no selection, no hover state and no refitting, and
 * the camera is simply the point. What it does share is the teardown, which is
 * not optional -- see below.
 */
const props = defineProps<{
    mapId: string
    latitude: number | null
    longitude: number | null
    /** For the marker's accessible name. */
    label: string
}>()

const emit = defineEmits<{ error: [string] }>()

const coordinates = computed(() => (
    props.latitude === null || props.longitude === null
        ? null
        : { lat: props.latitude, lng: props.longitude }
))

/**
 * Close enough to read the street, and framed imperatively below rather than
 * through `options.bounds`: the module's options watcher calls `fitBounds` with
 * no padding and no maxZoom, which on a single point zooms to the building and
 * clips the marker against the edge.
 */
const PLACE_ZOOM = 15

const mapOptions = computed(() => ({
    style: 'mapbox://styles/mapbox/light-v11',
    renderWorldCopies: false,
    center: [coordinates.value?.lng ?? 0, coordinates.value?.lat ?? 0] as [number, number],
    zoom: PLACE_ZOOM,
    // Create-only, so it is the whole country rather than a box around this
    // place: longitudes run past 180 so the box reaches the Chathams without
    // wrapping the long way round.
    maxBounds: NZ_MAX_BOUNDS,
}))

const mapRef = useMapboxRef(props.mapId)

function onMapError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? '')
    emit('error', message || 'The map could not be loaded.')
}

/**
 * The marker, added imperatively.
 *
 * MapboxDefaultMarker would do, but it renders a stray div and gives no way to
 * name the marker for a screen reader. One marker is less code than working
 * around that.
 */
let marker: import('mapbox-gl').Marker | undefined

watch([mapRef, coordinates], async ([map, position]) => {
    if (!map || !position) return

    marker?.remove()
    const { Marker } = await import('mapbox-gl')
    marker = new Marker({ color: '#349494' })
        .setLngLat([position.lng, position.lat])
        .addTo(map)

    marker.getElement().setAttribute('aria-label', props.label)
    map.easeTo({ center: [position.lng, position.lat], zoom: PLACE_ZOOM, duration: 0 })
}, { immediate: true })

/**
 * Give the WebGL context back.
 *
 * Copied from the finder's map, where it is load bearing for the same reason:
 * the module's own teardown only forgets the instance, never calls `remove()`,
 * and it turns on `keepalive` app wide, so maps accumulate. Browsers allow
 * somewhere between eight and sixteen live contexts, after which the oldest is
 * dropped and that map goes blank -- which, on a page a reader reaches once per
 * voting place, happens quickly.
 *
 * The instance is captured while it exists, because the module deletes it from
 * its registry in the child's own teardown, and `remove()` waits for
 * `onUnmounted` rather than `onBeforeUnmount`, because children unmount in
 * between.
 */
let mapInstance: ReturnType<typeof useMapboxRef>['value']

watch(mapRef, (map) => {
    if (map) mapInstance = map
}, { immediate: true })

onUnmounted(() => {
    marker?.remove()
    marker = undefined
    mapInstance?.remove()
    mapInstance = undefined
})
</script>
