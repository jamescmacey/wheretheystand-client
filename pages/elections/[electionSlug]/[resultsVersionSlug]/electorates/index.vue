<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    Electorates
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <ULink :to="'/elections/' + election.slug + '/' + resultsVersion.slug + '/electorates/1'">quick link to electorate 1</ULink>
            <div class="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto pt-0">
                <div class="flex flex-col gap-4 px-4">
                    {{ electionDataStore.getComputedElectorateResults(props.election.slug, props.resultsVersion.slug) }}
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup>
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

const electionDataStore = useElectionDataStore()
const results = computed(() => electionDataStore.getResultsData(props.election.slug, props.resultsVersion.slug, { results_level: 'national' }))
</script>