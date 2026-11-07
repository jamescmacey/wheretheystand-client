<template>
    <ElectionsLayoutDashboardPage heading="What if?">
        <template v-if="allocation">
            <!-- Always shown: seat numbers get screenshotted, and these must never
                 pass for a result. -->
            <UAlert color="warning" variant="subtle" icon="i-lucide-flask-conical"
                title="This is a hypothetical, not a real or official result"
                :description="isEmpty
                    ? 'You haven\'t changed anything yet, so the seats below follow the real count. Your changes are saved on this device and only ever show on this page.'
                    : 'The seats below are worked out using the changes you\'ve made. Your changes are saved on this device and only ever show on this page.'">
                <template v-if="!isEmpty" #actions>
                    <UButton color="warning" variant="subtle" size="sm" icon="i-lucide-rotate-ccw"
                        label="Reset all" @click="resetAll" />
                </template>
            </UAlert>

            <ElectionsParliamentSeatsOverview :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" title="Seats in this scenario" />

            <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-4 items-start">
                <ElectionsParliamentCoalitionOptions :election="election" :resultsVersion="resultsVersion"
                    :allocation="allocation" />
                <ElectionsWhatIfElectoralLaw :electionSlug="election.slug" />
                <ElectionsWhatIfPinElectorates :election="election" :resultsVersion="resultsVersion"
                    :applied="applied" />
                <ElectionsWhatIfSpecialVotes :election="election" :resultsVersion="resultsVersion"
                    :realInput="realInput" :applied="applied" :lookup="lookup" />
            </div>
        </template>

        <ElectionsResultsEmpty v-else title="No party vote yet"
            description="The national party vote has not been reported yet, so the seats cannot be worked out." />
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionsWhatIfEnabled } from '~/composables/useElectionsWhatIf'
import { useResultsScope } from '~/composables/useElectionSource'
import { useWhatIfAllocation, useWhatIfScenario } from '~/composables/useWhatIf'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// The sidebar link is gated too, but a route is reachable without it.
if (!useElectionsWhatIfEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

// Who won each electorate, as on the Parliament page, and released on leaving.
useResultsScope({ kind: 'all-electorates' })

const { isEmpty, resetAll } = useWhatIfScenario(() => props.election.slug)
const { allocation, applied, lookup, realInput } = useWhatIfAllocation(
    () => props.election, () => props.resultsVersion)
</script>
