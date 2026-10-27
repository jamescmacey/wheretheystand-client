<template>
    <UPageCard :to="to" variant="subtle" class="h-full">
        <div class="flex items-start justify-between gap-2">
            <!-- The card is a link in its own right, so nothing inside it is. -->
            <ElectionsEntityElectorateLabel :election="election" :resultsVersion="resultsVersion"
                :electorate="electorate.number" :link="false" />
            <ElectionsResultsElectorateStatusBadge :status="result?.resultStatus" :is-final="isFinal" />
        </div>

        <USeparator class="my-3" />

        <ElectionsEntityCandidateLabel v-if="leaderNumber !== null" :election="election"
            :resultsVersion="resultsVersion" :candidate="leaderNumber" :link="false" />
        <p v-else class="text-sm text-muted">{{ emptyMessage }}</p>

        <ElectionsResultsMarginPill class="mt-3 block" :result="result" />
    </UPageCard>
</template>

<script setup lang="ts">
import type {
    ComputedElectorateResult, ElectionSummary, ReferenceElectorate, ResultsVersion,
} from '~/types/elections'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: ReferenceElectorate
    result?: ComputedElectorateResult | null
    isFinal?: boolean
}>()

const to = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates/${props.electorate.number}`)

// Only ever the sole leader: showing one name for a tie would state an outcome
// the count does not support.
const leaderNumber = computed(() => {
    const first = props.result?.firstPlace
    return first && first.length === 1 ? first[0]! : null
})

const emptyMessage = computed(() => {
    if (!props.electorate.accepting_candidate_votes) return 'No candidate election was held.'
    if (props.result?.resultStatus === 'indeterminate') return 'The leading candidates are tied.'
    return 'No candidate results yet.'
})
</script>
