<template>
    <ElectionsLayoutDashboardPage :title="election.name">
        <template #actions>
            <ElectionsNavigationResultsVersionSwitch class="min-w-0" :election="election"
                :resultsVersion="resultsVersion" />
        </template>
        <template #heading>
            <h1 class="text-2xl lg:text-5xl font-bold">{{ election.name }}</h1>
            <p class="text-md lg:text-xl text-muted">{{ resultsVersion.name }}</p>
        </template>

        <ElectionsResultsKeyStatsGrid :election="election" :resultsVersion="resultsVersion" />

        <!-- A by-election is one contest, and the overview is the natural place
             to show it: there is no national picture to summarise and no second
             page worth sending a reader to for the only result there is. -->
        <template v-if="!hasPartyVote">
            <ElectionsResultsElectorateResults v-if="soleElectorate" :election="election"
                :resultsVersion="resultsVersion" :electorate="soleElectorate.number"
                category="candidate_votes" />
            <ElectionsResultsEmpty v-else title="No results yet"
                description="Results for this by-election have not been reported yet." />
        </template>

        <template v-else>
            <ElectionsResultsSeatAllocationSummary :election="election" :resultsVersion="resultsVersion" />

            <ElectionsResultsNationalPartyResults :election="election" :resultsVersion="resultsVersion" />

            <ElectionsResultsCloseRacesList :election="election" :resultsVersion="resultsVersion"
                :empty-message="closeRacesEmptyMessage">
                <template #empty-action>
                    <UButton v-if="!loadElectorates" color="neutral" variant="subtle"
                        icon="i-lucide-download" @click="loadAllElectorates">
                        Load electorate results
                    </UButton>
                </template>
            </ElectionsResultsCloseRacesList>
        </template>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionShape } from '~/composables/useElectionShape'
import { useResultsScope } from '~/composables/useElectionSource'
import { useElectionDataStore } from '~/stores/electionData'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const { hasPartyVote, soleElectorate } = useElectionShape()

/**
 * Whether to hold every electorate's results open.
 *
 * Off by default, and that is the whole point. This is the page people leave
 * open all evening, and during a live count every electorate is a separate
 * Firestore document billed on every change -- 144 of them, against the one
 * this page otherwise needs. Archived results arrive in a single file that
 * already contains them all, so there the closest-races list fills itself and
 * this is never offered.
 *
 * Once the worker publishes `results_summary` this goes away entirely: one
 * document carries every margin.
 */
const loadElectorates = ref(false)

// A function rather than an inline assignment: the expression form returns the
// assigned value, which is not a valid click handler.
function loadAllElectorates() {
    loadElectorates.value = true
}

const hasElectorateResults = computed(() =>
    store.computedElectorateResults(props.election.slug, props.resultsVersion.slug).size > 0)

useResultsScope(() => {
    if (!hasPartyVote.value) {
        // A by-election has no national tally, so its one electorate is the
        // subscription and the only thing this page watches.
        return soleElectorate.value
            ? { kind: 'electorate' as const, electorate: soleElectorate.value.number }
            : null
    }
    return loadElectorates.value ? { kind: 'all-electorates' as const } : null
})

const closeRacesEmptyMessage = computed(() =>
    (hasElectorateResults.value
        ? 'No electorate has a margin to compare yet.'
        : 'Electorate results are not loaded on this page while counting is live.'))
</script>
