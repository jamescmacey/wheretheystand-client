<template>
    <div v-if="status === 'success'">
        <PageHeader :pageTitle="electorate.name" :pageSubtitle="electorate.electorate_type === 'general' ? 'General electorate' : 'Māori electorate'"></PageHeader>
        <UContainer class="my-8">
            <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="col-span-1" v-if="electorate.status === 'current' || currentIncumbent">
                    <h3 class="text-lg font-bold mb-2">Current member of Parliament</h3>
                    <UCard v-if="!currentIncumbent">
                        <UEmpty title="Vacant" description="No current member of Parliament for this electorate." />
                    </UCard>
                    <WContentItemCard
                        v-else
                        :item="{ colour: currentIncumbent.person.cached_colour }"
                        :to="'/people/' + currentIncumbent.person.slug"
                        :fill-height="false"
                    >
                        <div class="w-full flex flex-col items-center justify-center text-center py-2 gap-2.5">
                            <img
                                :src="currentIncumbent.person.photo?.file || '/images/generic-profile-picture.png'"
                                :alt="currentIncumbent.person.display_name"
                                class="w-24 h-24 rounded-full object-cover shrink-0 ring ring-default"
                            >
                            <p class="w-full text-center text-xl font-semibold text-highlighted">
                                {{ currentIncumbent.person.display_name }}
                            </p>
                            <p v-if="incumbentPartyName(currentIncumbent)" class="w-full text-center text-base text-muted">
                                {{ incumbentPartyName(currentIncumbent) }}
                            </p>
                        </div>
                    </WContentItemCard>
                </div>
                <div class="col-span-2">
                    <template v-if="hasMap">
                            <ClientOnly>
                                <MapboxMap
                                    :key="mapInstanceKey"
                                    :map-id="mapInstanceKey"
                                    class="h-[420px] w-full rounded-md"
                                    :options="mapOptions"
                                >
                                    <MapboxSource
                                        v-if="mapGeoJson"
                                        :source-id="mapSourceId"
                                        :source="mapSource"
                                    />
                                    <MapboxLayer
                                        v-if="mapGeoJson"
                                        :layer="{
                                            id: mapFillLayerId,
                                            type: 'fill',
                                            source: mapSourceId,
                                            paint: {
                                                'fill-color': '#349494',
                                                'fill-opacity': 0.12
                                            }
                                        }"
                                    />
                                    <MapboxLayer
                                        v-if="mapGeoJson"
                                        :layer="{
                                            id: mapOutlineLayerId,
                                            type: 'line',
                                            source: mapSourceId,
                                            paint: {
                                                'line-color': '#349494',
                                                'line-width': 2
                                            }
                                        }"
                                    />
                                </MapboxMap>
                            </ClientOnly>
                            <UAlert
                                v-if="mapError"
                                color="warning"
                                variant="subtle"
                                title="Unable to load electorate map"
                                :description="mapError"
                                class="mt-4"
                            />
                            <div v-if="mapLoadStatus === 'loading'" class="pt-4">
                                <UProgress animation="swing" />
                            </div>
                            <div class="text-right">
                                <FileModal
                                    v-if="selectedMapFile"
                                    :file="selectedMapFile"
                                    icon="i-lucide-map"
                                    buttonText="Boundary map file information"
                                    :title="selectedMapFile.file ? selectedMapFile.file.split('/').pop() : ''"
                                />
                          
                            </div>
                            
                    </template>
                    <template v-else>
                        <ElectoratesMembersOfParliament
                            :groups="groupedElectorateHistory"
                            :status="electorateHistoryStatus"
                            @refresh="electorateHistoryRefresh"
                        />
                    </template>
                </div>
            </div>

            <div v-if="hasMap" class="mt-8">
                <ElectoratesMembersOfParliament
                    :groups="groupedElectorateHistory"
                    :status="electorateHistoryStatus"
                    @refresh="electorateHistoryRefresh"
                />
            </div>

            <template v-if="hasElectorateHistoryLinks">
                <USeparator icon="i-lucide-history" class="my-8" />
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div v-if="electorate.replaced">
                        <h3 class="text-lg font-bold mb-2">Former electorate</h3>
                        <UPageCard :to="'/electorates/' + electorate.replaced.slug">
                            <template #title>
                                {{ electorate.replaced.name }}
                            </template>
                            <template #description>
                                Replaced on {{ formatDate(electorate.valid_from) }}
                            </template>
                        </UPageCard>
                    </div>
                    <div v-else></div>
                    <div v-if="electorate.replacement" class="">
                        <h3 class="text-lg font-bold mb-2">Replacement electorate</h3>
                        <UPageCard :to="'/electorates/' + electorate.replacement.slug">
                            <template #title>
                                <div class="flex">
                                    {{ electorate.replacement.name }}
                                </div>
                            </template>
                            <template #description>
                                <div class="flex">
                                    Replaced on {{ formatDate(electorate.valid_to, 1) }}
                                </div>
                            </template>
                        </UPageCard>
                    </div>
                </div>
            </template>
        </UContainer>
    </div>
    <div v-else>
        <UContainer class="my-8">
            <UCard v-if="status === 'pending'" class="w-full">
                <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                    <h3 class="mb-2 text-muted">Loading {{ route.params.id }}...</h3>
                    <UProgress animation="swing" />
                </div>
            </UCard>
            <UEmpty v-else :title="'Error loading ' + route.params.id"
                :description="'An error occurred while loading this electorate. Please try again.'">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="refresh()" class="mt-4" icon="i-lucide-refresh-cw"
                        trailing>
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
            <p v-if="error && status === 'error'" class="text-muted text-xs text-center mt-4">
                {{ error.statusCode }}: {{ error }}
            </p>
        </UContainer>
    </div>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

import { format, addDays, parse } from 'date-fns'



const formatDate = (date, daysToAdd = 0) => {

    if (daysToAdd > 0) {
        // convert the date to an object to add a day
        const dateObject = parse(date, 'yyyy-MM-dd', new Date())
        const newDate = addDays(dateObject, daysToAdd)
        return format(newDate, 'd MMMM yyyy')
    } else {
        return format(date, 'd MMMM yyyy')
    }
}

const incumbentPartyName = (historyItem) => {
    const fromAffiliation = historyItem?.party_affiliation?.party?.display_name
    if (fromAffiliation) return fromAffiliation
    const fromCachedDescription = historyItem?.person?.cached_description
    if (!fromCachedDescription) return ''
    return String(fromCachedDescription).split(' · ')[0]?.trim() || ''
}

const electorateHistoryKey = computed(() => `electorate-history-${route.params.id}`)
const { data: electorateHistory, status: electorateHistoryStatus, error: electorateHistoryError, refresh: electorateHistoryRefresh, clear: electorateHistoryClear } = await useAsyncData(electorateHistoryKey, () => $fetch(apiBase + 'electorates/' + route.params.id + '/history/'))
const electorateBoundaryKey = computed(() => `electorate-boundaries-${route.params.id}`)
const { data: electorateBoundaries } = await useAsyncData(
    electorateBoundaryKey,
    () => $fetch(apiBase + 'electorates/' + route.params.id + '/boundaries/')
)

const hasElectorateHistoryLinks = computed(() => Boolean(electorate.value?.replaced || electorate.value?.replacement))

const selectedBoundary = computed(() => {
    const boundaries = electorateBoundaries.value || []
    if (!boundaries.length) return null
    const sorted = [...boundaries].sort((a, b) => {
        const aDate = a?.boundary_set?.valid_from || ''
        const bDate = b?.boundary_set?.valid_from || ''
        return bDate.localeCompare(aDate)
    })
    return sorted[0] || null
})

const selectedMapFile = computed(() => {
    const boundary = selectedBoundary.value
    if (!boundary) return null
    return boundary?.simplified_shape || boundary?.shape || null
})
const selectedGeoJsonUrl = computed(() => selectedMapFile.value?.file || '')
const hasMap = computed(() => Boolean(selectedGeoJsonUrl.value))
const mapInstanceKey = computed(() => `electorate-map-${route.params.id}`)
const mapSourceId = computed(() => `electorate-map-source-${route.params.id}`)
const mapFillLayerId = computed(() => `electorate-map-fill-${route.params.id}`)
const mapOutlineLayerId = computed(() => `electorate-map-outline-${route.params.id}`)
const mapSource = computed(() => ({ type: 'geojson', data: mapGeoJson.value }))
const mapCrossesAntimeridian = computed(() => {
    const bounds = mapBounds.value
    if (!bounds) return false
    const [[minLng], [maxLng]] = bounds
    return minLng < -180 || maxLng > 180 || (maxLng - minLng) > 180
})
const paddedMaxBounds = computed(() => {
    const bounds = mapBounds.value
    if (!bounds) return null

    const [[minLng, minLat], [maxLng, maxLat]] = bounds
    const lngPad = Math.max((maxLng - minLng) * 0.6, 0.8)
    const latPad = Math.max((maxLat - minLat) * 0.6, 0.6)

    if (mapCrossesAntimeridian.value) {
        // maxBounds cannot express a tight antimeridian-crossing rectangle.
        // Restrict latitude strongly and longitude to world limits.
        return [
            [-180, minLat - latPad],
            [180, maxLat + latPad]
        ]
    }

    return [
        [minLng - lngPad, minLat - latPad],
        [maxLng + lngPad, maxLat + latPad]
    ]
})
const selectedMapAttribution = computed(() => {
    const file = selectedMapFile.value
    if (!file) return ''
    const parts = [
        file?.copyright_owner?.name ? `Shape copyright: ${file.copyright_owner.name}` : null,
        file?.licence?.name ? `licensed under the ${file.licence.name}` : null,
        file?.licence_grantor?.name ? `licence by ${file.licence_grantor.name}.` : null
    ].filter(Boolean)
    return parts.join(' ')
})

const mapGeoJson = ref(null)
const mapBounds = ref(null)
const mapLoadStatus = ref('idle')
const mapError = ref('')

const normalizeGeoJson = (input) => {
    let geojson = input
    if (typeof geojson === 'string') {
        try {
            geojson = JSON.parse(geojson)
        } catch {
            return null
        }
    }

    if (!geojson || typeof geojson !== 'object' || !geojson.type) return null

    if (geojson.type === 'FeatureCollection') return geojson
    if (geojson.type === 'Feature') {
        return { type: 'FeatureCollection', features: [geojson] }
    }
    if (geojson.type === 'GeometryCollection' && Array.isArray(geojson.geometries)) {
        return {
            type: 'FeatureCollection',
            features: geojson.geometries.map((geometry) => ({
                type: 'Feature',
                properties: {},
                geometry
            }))
        }
    }
    if (geojson.coordinates) {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: geojson
            }]
        }
    }
    return null
}

const updateBoundsFromGeoJson = (geojson) => {
    const coords = []
    const collectCoordinates = (value) => {
        if (!Array.isArray(value)) return
        if (typeof value[0] === 'number' && typeof value[1] === 'number') {
            coords.push(value)
            return
        }
        value.forEach((nested) => collectCoordinates(nested))
    }

    if (geojson?.type === 'FeatureCollection') {
        geojson.features.forEach((feature) => collectCoordinates(feature?.geometry?.coordinates))
    } else if (geojson?.type === 'Feature') {
        collectCoordinates(geojson?.geometry?.coordinates)
    } else if (geojson?.type && geojson?.coordinates) {
        collectCoordinates(geojson.coordinates)
    }

    if (!coords.length) return null

    let minLng = coords[0][0]
    let minLat = coords[0][1]
    let maxLng = coords[0][0]
    let maxLat = coords[0][1]

    coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng)
        minLat = Math.min(minLat, lat)
        maxLng = Math.max(maxLng, lng)
        maxLat = Math.max(maxLat, lat)
    })

    const directSpan = maxLng - minLng
    const wrappedLongitudes = coords.map(([lng]) => (lng < 0 ? lng + 360 : lng))
    const wrappedMin = Math.min(...wrappedLongitudes)
    const wrappedMax = Math.max(...wrappedLongitudes)
    const wrappedSpan = wrappedMax - wrappedMin

    if (wrappedSpan < directSpan) {
        return [[wrappedMin, minLat], [wrappedMax, maxLat]]
    }

    return [[minLng, minLat], [maxLng, maxLat]]
}

watch(
    selectedGeoJsonUrl,
    async (url) => {
        if (!url) {
            mapGeoJson.value = null
            mapBounds.value = null
            mapLoadStatus.value = 'idle'
            mapError.value = ''
            return
        }
        mapLoadStatus.value = 'loading'
        mapError.value = ''
        try {
            const responseData = await $fetch(url, { responseType: 'json' })
            const geoJson = normalizeGeoJson(responseData)
            if (!geoJson) {
                throw new Error('Invalid GeoJSON payload.')
            }
            mapGeoJson.value = geoJson
            mapBounds.value = updateBoundsFromGeoJson(geoJson)
            mapLoadStatus.value = 'success'
        } catch {
            mapGeoJson.value = null
            mapBounds.value = null
            mapLoadStatus.value = 'error'
            mapError.value = 'The map file was loaded but is not valid GeoJSON for rendering.'
        }
    },
    { immediate: true }
)

const mapOptions = computed(() => ({
    style: 'mapbox://styles/mapbox/light-v11',
    renderWorldCopies: false,
    ...(mapBounds.value
        ? {
            bounds: mapBounds.value,
            fitBoundsOptions: { padding: 32 },
            maxBounds: paddedMaxBounds.value
        }
        : { center: [172.6, -41.2], zoom: 4.5 })
}))

const todayYmd = (() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
})()

const isCurrentHistoryItem = (entry) => {
    const startDate = entry?.sworn_date || entry?.elected_date
    if (!startDate) return false
    if (startDate > todayYmd) return false
    return !entry?.end_date || entry.end_date >= todayYmd
}

const currentIncumbent = computed(() => {
    const history = electorateHistory.value || []
    if (!history.length) return null
    const current = history.find((entry) => isCurrentHistoryItem(entry))
    return current || null
})

const isConsecutiveTerm = (olderEntry, newerEntry) => {
    if (!olderEntry || !newerEntry) return false
    // "Consecutive" means no different MP appears between these entries
    // in the chronology for this electorate.
    return olderEntry?.person?.slug === newerEntry?.person?.slug
}

const groupedElectorateHistory = computed(() => {
    const history = electorateHistory.value || []
    if (!history.length) return []

    const chronological = [...history].reverse()
    const groups = []

    for (const entry of chronological) {
        const lastGroup = groups[groups.length - 1]
        const lastEntryInGroup = lastGroup?.entries?.[lastGroup.entries.length - 1]
        if (lastGroup && isConsecutiveTerm(lastEntryInGroup, entry)) {
            lastGroup.entries.push(entry)
            continue
        }

        groups.push({ entries: [entry] })
    }

    return groups
        .map((group, groupIndex) => {
            const displayEntry = group.entries[group.entries.length - 1]
            const uniquePartyNames = Array.from(
                new Set(
                    group.entries
                        .map((entry) => incumbentPartyName(entry))
                        .filter(Boolean)
                )
            )

            return {
                key: `${displayEntry.id}-${groupIndex}`,
                person: displayEntry.person,
                partyLabel: uniquePartyNames.join(' / '),
                dateRanges: [...group.entries]
                    .reverse()
                    .map((entry) => incumbencyDateLabel(entry))
            }
        })
        .reverse()
})

const incumbencyDateLabel = (entry) => {
    const startDate = entry?.sworn_date || entry?.elected_date
    if (!startDate) return 'Unknown'
    if (!entry?.end_date) return `${formatDate(startDate)} to present`
    return `${formatDate(startDate)} to ${formatDate(entry.end_date)}`
}

const electorateKey = computed(() => `electorate-${route.params.id}`)
const { data: electorate, status, error, refresh, clear } = await useAsyncData(electorateKey, () => $fetch(apiBase + 'electorates/' + route.params.id + '/'))

usePageSeo({
    title: () => electorate.value?.name,
    description: () => {
        const e = electorate.value
        if (!e) return undefined
        const typeLabel = e.electorate_type === 'maori' ? 'Māori electorate' : 'General electorate'
        return typeLabel
    },
})

</script>

<style scoped></style>