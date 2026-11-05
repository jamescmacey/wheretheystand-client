<template>
    <ElectionsLayoutDashboardPage heading="Parliament">
        <template v-if="allocation">
            <UAlert v-if="!isOfficial" color="warning" variant="subtle" icon="i-lucide-flask-conical"
                title="These are not the official rules"
                description="The seats below are worked out using the rules set on the Settings page, not the ones in the Electoral Act."
                class="mb-2" />

            <ElectionsParliamentSeatsOverview :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" />

            <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-4">
                <ElectionsParliamentCoalitionOptions :election="election" :resultsVersion="resultsVersion"
                    :allocation="allocation" />
                <ElectionsParliamentWastedVoteCard :election="election" :resultsVersion="resultsVersion"
                    :allocation="allocation" />
            </div>

            <ElectionsParliamentThresholdPanel :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" />

            <ElectionsParliamentMemberList :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" />

            <!-- The workings, folded away. Most readers want the outcome; the
                 ones who want to check it should not have to go to another page
                 that could disagree with this one. -->
            <UCollapsible>
                <UButton color="neutral" variant="subtle" trailing-icon="i-lucide-chevron-down"
                    label="Show the arithmetic" class="self-start" />
                <template #content>
                    <div class="pt-4 space-y-4">
                        <ElectionsParliamentQuotientTable :election="election"
                            :resultsVersion="resultsVersion" :allocation="allocation" />
                        <ElectionsParliamentOfficialComparison :election="election"
                            :resultsVersion="resultsVersion" :allocation="allocation" />
                    </div>
                </template>
            </UCollapsible>
        </template>

        <ElectionsResultsEmpty v-else title="No party vote yet"
            description="The national party vote has not been reported yet, so the seats cannot be worked out." />
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useSeatAllocation } from '~/composables/useSeatAllocation'
import { useMmpSettings } from '~/composables/useMmpSettings'
import { useResultsScope } from '~/composables/useElectionSource'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// Who won each electorate, which needs every electorate's results. The most
// expensive scope in the dashboard, and released as soon as this page closes.
useResultsScope({ kind: 'all-electorates' })

const { allocation } = useSeatAllocation(() => props.election, () => props.resultsVersion)
const { isOfficial } = useMmpSettings()
</script>
