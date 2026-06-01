<template>
    <div class="flex flex-col h-full w-full bg-accented flex-grow items-center justify-center px-4 overflow-hidden">
        <div class="relative w-full max-w-lg">
            <div class="mx-0 lg:m-8 my-8 relative text-left">
                <div class="grid gap-8 items-start justify-center">
                    <div class="relative group">
                        <UCard class="transition-opacity duration-500 relative">
                            <div v-if="persistentDataStatus === 'pending' || referenceDataStatus === 'pending'">
                                <h5 class="text-lg mb-1 text-left font-brand font-bold">Loading data...</h5>
                                <UProgress animation="swing" class="mt-4" />
                            </div>
                            <div v-else-if="persistentDataStatus === 'error' || referenceDataStatus === 'error'">
                                <h5 class="text-lg mb-1 text-left font-brand font-bold text-error">Error loading data
                                </h5>
                                <p class="text-md mt-2 text-left text-muted">
                                    {{ persistentDataError || referenceDataError }}
                                </p>
                                <UButton variant="subtle" color="neutral" @click="refreshData()" class="mt-4"
                                    icon="i-lucide-refresh-cw" trailing>
                                    Retry
                                </UButton>
                            </div>
                            <div v-else>
                                <h5 class="text-lg mb-1 text-left font-brand font-bold">Data loaded</h5>
                                <p class="text-md mt-2 text-left text-muted">
                                    Persistent data and reference data have been successfully loaded.
                                </p>
                            </div>
                        </UCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const electionSlug = computed(() => route.params.electionSlug)
const resultsVersionSlug = computed(() => route.params.resultsVersionSlug)

// Get the election data store
const electionDataStore = useElectionDataStore()

// Fetch persistent data
const persistentDataKey = computed(() => `elections-persistent-data`)
const {
    data: persistentData,
    status: persistentDataStatus,
    error: persistentDataError,
    refresh: refreshPersistentData
} = await useAsyncData(
    persistentDataKey,
    () => $fetch(apiBase + 'elections/persistent-data/'),
    { lazy: true }
)

// Fetch reference data
const referenceDataKey = computed(() => `elections-${electionSlug.value}-${resultsVersionSlug.value}-reference-data`)
const {
    data: referenceData,
    status: referenceDataStatus,
    error: referenceDataError,
    refresh: refreshReferenceData
} = await useAsyncData(
    referenceDataKey,
    () => $fetch(apiBase + `elections/${electionSlug.value}/${resultsVersionSlug.value}/reference-data/`),
    {
        lazy: true,
        watch: [electionSlug, resultsVersionSlug]
    }
)

// Fetch results data
const resultsDataKey = computed(() => `elections-${electionSlug.value}-${resultsVersionSlug.value}-results-all`)
const {
    data: resultsData,
    status: resultsDataStatus,
    error: resultsDataError,
    refresh: refreshResultsData
} = await useAsyncData(resultsDataKey, () => $fetch(apiBase + `elections/${electionSlug.value}/${resultsVersionSlug.value}/results/`), { lazy: true, watch: [electionSlug, resultsVersionSlug] })

// Update store when persistent data is successfully loaded
watch(persistentData, (newData) => {
    if (newData && persistentDataStatus.value === 'success') {
        electionDataStore.setPersistentData(newData)
    }
}, { immediate: true })

// Update store when reference data is successfully loaded
watch([referenceData, electionSlug, resultsVersionSlug], ([newData, slug, version]) => {
    if (newData && referenceDataStatus.value === 'success' && slug && version) {
        electionDataStore.setReferenceData(slug, version, newData)
    }
}, { immediate: true })

// Update store when results data is successfully loaded
watch(resultsData, (newData) => {
    if (newData && resultsDataStatus.value === 'success') {
        electionDataStore.updateResultsData(electionSlug.value, resultsVersionSlug.value, newData.results_sets)
    }
}, { immediate: true })

// Refresh both data sources
const refreshData = () => {
    refreshPersistentData()
    refreshReferenceData()
    refreshResultsData()
}
</script>
