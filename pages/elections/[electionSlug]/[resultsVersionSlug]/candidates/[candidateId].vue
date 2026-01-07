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
                <div class="flex flex-col gap-4 px-4">
                    <div>
                        <h2 class="text-2xl font-bold">{{ candidate.name }}</h2>
                    </div>
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

const candidateId = route.params.candidateId
const electionDataStore = useElectionDataStore()
const candidate = computed(() =>
    electionDataStore.getCandidateForCandidate(
        props.election.slug,
        props.resultsVersion.slug,
        { id: candidateId, number: Number(candidateId) }
    )
)

// Watch candidate and raise 404 if not found
watch(candidate, (newCandidate) => {
    if (!newCandidate) {
        throw createError({ statusCode: 404, statusMessage: "Candidate not found" })
    }
}, { immediate: true })

const breadcrumbItems = computed(() => [
    {
        label: 'Candidates',
        to: '/elections/' + props.election.slug + '/' + props.resultsVersion.slug + '/candidates',
        icon: 'i-lucide-users',
    },
    {
        label: candidate.value.name,
    }
])
</script>