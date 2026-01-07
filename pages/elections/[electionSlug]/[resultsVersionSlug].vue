<template>
    <div v-if="election && resultsVersion" class="w-full h-full">
        <ElectionsLoadingCountdown v-if="showCountdown" :election="election" @polls_closed="handlePollsClosed" />
        <ElectionsLoadingLoader v-else-if="!isDataLoaded" />
        <NuxtPage v-else :election="election" :resultsVersion="resultsVersion" />
    </div>
</template>

<script setup>
const props = defineProps({
    election: {
        type: Object,
        required: true,
    }
})

const route = useRoute()
const electionSlug = computed(() => route.params.electionSlug)
const resultsVersionSlug = computed(() => route.params.resultsVersionSlug)
const resultsVersion = computed(() => {
     return props.election.results_versions?.find(version => version.slug === resultsVersionSlug.value)
})

// Get the election data store
const electionDataStore = useElectionDataStore()

// Check if both persistent data and reference data are loaded
const isDataLoaded = computed(() => {
    return electionDataStore.isPersistentDataLoaded && 
           electionDataStore.isReferenceDataLoaded(electionSlug.value, resultsVersionSlug.value) &&
           electionDataStore.isResultsDataLoaded(electionSlug.value, resultsVersionSlug.value)
})

const pollsClosed = ref(false)

const showCountdown = computed(() => {
    if (pollsClosed.value) {
        return false
    }
    if (!props.election.polls_close) {
        return false
    }
    const pollsCloseDate = new Date(props.election.polls_close)
    const now = new Date()
    return now < pollsCloseDate
})

const handlePollsClosed = () => {
    pollsClosed.value = true
}
</script>