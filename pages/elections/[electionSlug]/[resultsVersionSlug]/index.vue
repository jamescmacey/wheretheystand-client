<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    {{ election.name }}
                </template>
                <template #right>
                    <ElectionsNavigationResultsVersionSwitch :election="election" :resultsVersion="resultsVersion" />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto pt-0">
                <div class="flex flex-col gap-4 px-4">
                    <div class="mb-1 mt-2 lg:mt-8 space-y-4">
                        <h1 class="text-2xl lg:text-5xl font-bold">{{ election.name }}</h1>
                        <p class="text-md lg:text-xl text-muted">{{ resultsVersion.name }}</p>
                        <div class="flex items-center gap-2">


                            <UBadge :avatar="{
                                src: '/images/firebase-logomark.png',
                                alt: 'Firebase',
                                ui: { root: 'bg-transparent' }
                            }" size="md" color="error" variant="outline">
                                Connected to Firebase
                            </UBadge>
                            <UBadge icon="i-lucide-check-circle" variant="outline">
                                {{ progress }} per cent counted (1,234 of 5,678)
                            </UBadge>
                        </div>
                    </div>
                    <UCard variant="soft">
                        <!-- Table header -->
                        <div class="flex items-center gap-4 font-medium mb-2">
                            <div class="flex-shrink-0 w-60">
                                <USwitch v-model="minSeats" size="sm" class="text-muted" label="Show all" />
                            </div>
                            <div class="flex-grow">
                                <div class="flex items-center gap-2">
                                    <div class="w-1/2">

                                    </div>
                                    <div class="w-1/2 border-l border-gray-200 pl-2 text-sm uppercase text-muted">
                                        {{ Math.floor(total_seats / 2) + 1 }} to govern
                                    </div>
                                </div>


                            </div>
                            <div
                                class="flex-shrink-0 w-16 text-right border-b border-gray-200 text-sm uppercase text-muted">
                                Elec.
                            </div>
                            <div
                                class="flex-shrink-0 w-16 text-right border-b border-gray-200 text-sm uppercase text-muted">
                                List
                            </div>
                            <div
                                class="flex-shrink-0 w-16 text-right border-b border-gray-200 text-sm uppercase text-muted font-bold">
                                Total
                            </div>
                            <div
                                class="flex-shrink-0 w-24 text-right border-b border-gray-200 text-sm uppercase text-muted">
                                Votes
                            </div>
                            <div
                                class="flex-shrink-0 w-24 text-right border-b border-gray-200 text-sm uppercase text-muted">
                                Share
                            </div>
                        </div>
                        <div class="flex items-center gap-4 py-2" v-for="result in results.results.sort((a, b) => b.count - a.count).filter(result => result.total_seats >= !minSeats).sort((a, b) => b.total_seats - a.total_seats)" :key="result.id">
                            <div class="flex-shrink-0 w-60">
                                <div class="flex items-center space-x-2">
                                    <div class="flex-shrink-0 w-2 self-stretch flex items-center justify-center rounded-md" :style="{ backgroundColor: electionDataStore.getPersistentPartyForParty(props.election.slug, props.resultsVersion.slug, {id: result.party, number: Number(result.party)})?.colour || 'blue' }">
                                        
                                    </div>
                                    <div class="flex flex-col">
                                        {{ electionDataStore.getPartyForParty(props.election.slug, props.resultsVersion.slug, {id: result.party, number: Number(result.party)})?.name || 'Unknown party' }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <UProgress :model-value="result.per_cent" size="xl" :max="100"
                                    :ui="{ base: 'relative overflow-hidden rounded-sm bg-accented', 
                                    indicator: 'rounded-sm size-full transition-transform duration-200 ease-out' }" />
                            </div>
                            <div class="flex-shrink-0 w-16 text-right">
                                {{ result.electorate_seats }}
                            </div>
                            <div class="flex-shrink-0 w-16 text-right">
                                {{ result.list_seats }}
                            </div>
                            <div class="flex-shrink-0 w-16 text-right font-bold">
                                {{ result.total_seats }}
                            </div>
                            <div class="flex-shrink-0 w-24 text-right">
                                {{ result.count.toLocaleString() }}
                            </div>
                            <div class="flex-shrink-0 w-24 text-right">
                                {{ result.per_cent }}%
                            </div>
                        </div>
                        <div class="flex items-center gap-4 py-2 mt-2 bg-elevated rounded-full">
                            <div class="flex-grow text-muted text-sm px-4">
                                <span v-if="total_seats > 120">Includes an overhang of {{ total_seats - 120 }} seat<span v-if="total_seats - 120 > 1">s</span>.</span>
                            </div>
                            <div class="flex-shrink-0 w-16 text-right">
                                {{ total_list_seats }}
                            </div>
                            <div class="flex-shrink-0 w-16 text-right">
                                {{ total_electorate_seats }}
                            </div>
                            <div class="flex-shrink-0 w-16 text-right font-bold">
                                {{ total_seats }}
                            </div>
                            <div class="flex-shrink-0 w-24 text-right">
                                {{ results.total_votes_cast.toLocaleString() }}
                            </div>
                            <div class="flex-shrink-0 w-24 text-right">

                            </div>
                        </div>
                    </UCard>
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
const examplePartyColour = ref('#FFC0CB')

const progress = ref(50)

const resultsVersions = computed(() => props.election.results_versions.map(version => ({
    label: version.name,
    value: version.slug
}))
)
const selectedResultsVersion = ref(props.resultsVersion.slug)
const minSeats = ref(0)

const results = computed(() => electionDataStore.getResultsData(props.election.slug, props.resultsVersion.slug, { results_level: 'national' })[0])

const total_list_seats = computed(() => results.value.results.reduce((acc, result) => acc + result.list_seats, 0))
const total_electorate_seats = computed(() => results.value.results.reduce((acc, result) => acc + result.electorate_seats, 0))
const total_seats = computed(() => results.value.results.reduce((acc, result) => acc + result.total_seats, 0))

</script>