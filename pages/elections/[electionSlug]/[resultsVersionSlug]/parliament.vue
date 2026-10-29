<template>
    <ElectionsLayoutDashboardPage title="Parliament" heading="Parliament">
        <template v-if="allocation">
            <UAlert v-if="!isOfficial" color="warning" variant="subtle" icon="i-lucide-flask-conical"
                title="These are not the official rules"
                description="The seats below are worked out using the rules set on the Settings page, not the ones in the Electoral Act."
                class="mb-2" />

            <!-- Said once, here, rather than beside every number: until the
                 count is final these seats can still move, and the specials are
                 historically worth a seat or two. -->
            <UAlert v-if="!isFinal" color="neutral" variant="subtle" icon="i-lucide-info"
                title="The count is not final"
                description="Seats are worked out from the votes counted so far and will change as more are counted."
                class="mb-2" />

            <UAlert v-if="allocation.ties.length" color="warning" variant="subtle" icon="i-lucide-scale"
                title="The last seat is tied"
                description="Two or more parties have an equal claim to the final seat. The law settles this by lot, so it is not shown as won by either." />

            <UAlert v-if="allocation.undecidedElectorates.length" color="warning" variant="subtle"
                icon="i-lucide-scale" title="An electorate is tied"
                :description="`${pluralise(allocation.undecidedElectorates.length, 'electorate')} has no leading candidate, so the seat is not counted to any party.`" />

            <ElectionsParliamentSeatGrid :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" />

            <ElectionsParliamentPartySeats :election="election" :resultsVersion="resultsVersion"
                :allocation="allocation" />

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
import { useInjectedElectionSource, useResultsScope } from '~/composables/useElectionSource'
import { pluralise } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// Who won each electorate, which needs every electorate's results. The most
// expensive scope in the dashboard, and released as soon as this page closes.
useResultsScope({ kind: 'all-electorates' })

const { allocation } = useSeatAllocation(() => props.election, () => props.resultsVersion)
const { isOfficial } = useMmpSettings()

const source = useInjectedElectionSource()
const isFinal = computed(() => source?.isFinal.value ?? false)
</script>
