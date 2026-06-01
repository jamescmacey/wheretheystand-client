<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    <UBreadcrumb :items="breadcrumbItems" />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto pt-0">
                <div class="flex flex-col gap-4 px-4 space-y-4">
                        <h2 class="text-2xl font-bold">{{ electorate.name }}</h2>
                        <ElectionsResultsElectorateCandidate v-if="hasCandidateResults && electorate.accepting_candidate_votes" :electorate="electorate" :election="election" :resultsVersion="resultsVersion" :results="candidateResults[0]" />
                        <ElectionsResultsElectorateParty v-if="hasPartyResults" :electorate="electorate" :election="election" :resultsVersion="resultsVersion" :results="partyResults[0]" />
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup>
const route = useRoute()

const props = defineProps({
    election: {
        type: Object,
        required: true
    },
    resultsVersion: {
        type: Object,
        required: true
    }
})

const electorateId = route.params.electorateId
const electionDataStore = useElectionDataStore()
const electorate = computed(() =>
    electionDataStore.getElectorateForElectorate(
        props.election.slug,
        props.resultsVersion.slug,
        { id: electorateId, number: Number(electorateId) }
    )
)

// Watch electorate and raise 404 if not found
watch(electorate, (newElectorate) => {
    if (!newElectorate) {
        throw createError({ statusCode: 404, statusMessage: "Electorate not found" })
    }
}, { immediate: true })

const breadcrumbItems = computed(() => [
    {
        label: 'Electorates',
        to: '/elections/' + props.election.slug + '/' + props.resultsVersion.slug + '/electorates',
        icon: 'i-lucide-map',
    },
    {
        label: electorate.value.name + ' (' + electorate.value.id + ')',
    }
])



const electorateFilter = computed(() => [electorate.value.id, electorate.value.number])

const partyResults = computed(() => {
    if (!electorate.value) return []
    
    return electionDataStore.getResultsData(props.election.slug, props.resultsVersion.slug, { 
        results_level: 'electorate', 
        results_category: 'party_votes', 
        electorate: electorateFilter.value
    })
})

const candidateResults = computed(() => {
    if (!electorate.value) return []
    
    return electionDataStore.getResultsData(props.election.slug, props.resultsVersion.slug, { 
        results_level: 'electorate', 
        results_category: 'candidate_votes', 
        electorate: electorateFilter.value
    })
})

const hasPartyResults = computed(() => partyResults.value.length === 1)
const hasCandidateResults = computed(() => candidateResults.value.length === 1)
</script>