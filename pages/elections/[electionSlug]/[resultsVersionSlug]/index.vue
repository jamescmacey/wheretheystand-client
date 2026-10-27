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
                :empty-message="closeRacesEmptyMessage" />
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
 * This page asks for no results beyond the national tally.
 *
 * It used to offer to load every electorate, because the closest-races list
 * needs every margin and that meant 144 Firestore documents, each re-billed on
 * every change, on the page people leave open all evening. The summary
 * document carries every margin in one, and the source layer subscribes to it
 * throughout a live count, so the list now fills itself and there is nothing
 * to opt in to.
 */
useResultsScope(() => {
    // A by-election has no national tally, so its one electorate is the
    // subscription and the only thing this page watches.
    if (!hasPartyVote.value) {
        return soleElectorate.value
            ? { kind: 'electorate' as const, electorate: soleElectorate.value.number }
            : null
    }
    return null
})

const hasElectorateResults = computed(() =>
    store.computedElectorateResults(props.election.slug, props.resultsVersion.slug).size > 0)

const closeRacesEmptyMessage = computed(() =>
    (hasElectorateResults.value
        ? 'No electorate has a margin to compare yet.'
        : 'No electorate has reported a result yet.'))
</script>
