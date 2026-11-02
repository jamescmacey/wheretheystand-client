<template>
    <ElectionsLayoutDashboardPage :title="election.name">
        <template #actions>
            <ElectionsNavigationResultsVersionSwitch class="min-w-0" :election="election"
                :resultsVersion="resultsVersion" />
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
            <!-- The same chamber and card as the Parliament page, from the same
                 allocation, so the two can never disagree about a seat. -->
            <!-- Card beside the chamber on a wide screen; on a narrow one the
                 chamber comes first, as the picture the figures explain. -->
            <div v-if="allocation" class="grid gap-4 lg:grid-cols-2">
                <ElectionsParliamentPartySeats :election="election" :resultsVersion="resultsVersion"
                    :allocation="allocation" :to="parliamentHref" title="Parliament" variant="soft" />
                <!-- Carded to match its neighbour, and stretched to its height
                     with the chamber centred, so it does not float beside it. -->
                <UCard variant="soft" class="order-first lg:order-last"
                    :ui="{ body: 'h-full flex items-center justify-center' }">
                    <ElectionsParliamentSeatGrid :election="election" :resultsVersion="resultsVersion"
                        :allocation="allocation" class="w-full" />
                </UCard>
            </div>

            <!-- Side by side on a wide screen. The party card is too narrow
                 there for bars to say anything the share column does not. -->
            <div class="grid gap-4 items-start lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <ElectionsResultsNationalPartyResults :election="election" :resultsVersion="resultsVersion"
                    :show-bars="false" />
                <ElectionsResultsElectorateGrid :election="election" :resultsVersion="resultsVersion" />
            </div>

            <ElectionsResultsCloseRacesList :election="election" :resultsVersion="resultsVersion"
                :empty-message="closeRacesEmptyMessage" />
        </template>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionShape } from '~/composables/useElectionShape'
import { useSeatAllocation } from '~/composables/useSeatAllocation'
import { useResultsScope } from '~/composables/useElectionSource'
import { useElectionDataStore } from '~/stores/electionData'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const { hasPartyVote, soleElectorate } = useElectionShape()
const { allocation } = useSeatAllocation(() => props.election, () => props.resultsVersion)

const parliamentHref = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/parliament`)

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
