<template>
    <UPageCard :to="to" variant="subtle" class="h-full">
        <div class="flex flex-wrap items-start justify-between gap-2">
            <!-- The card is a link in its own right, so nothing inside it is. -->
            <div class="min-w-0 max-w-full">
                <ElectionsEntityElectorateBadge :election="election" :resultsVersion="resultsVersion"
                    :electorate="electorate.number" :link="false" />
            </div>

            <ElectionsResultsSeatChangeBadge :election="election" :resultsVersion="resultsVersion"
                :electorate="electorate.number" />
        </div>

        <USeparator class="my-3" />

        <p v-if="!leaders.length" class="text-sm text-muted">{{ emptyMessage }}</p>

        <!-- The two tallies with the margin between them, so the gap a reader
             is working out is written where they are already looking. -->
        <div v-else class="flex flex-col gap-1">
            <div v-for="(leader, index) in leaders" :key="leader.candidate">
                <div class="flex items-center justify-between gap-3">
                    <ElectionsEntityCandidateLabel :election="election" :resultsVersion="resultsVersion"
                        :candidate="leader.candidate" :link="false" />
                    <span class="tabular-nums font-medium shrink-0">
                        {{ formatCount(leader.count) }}
                    </span>
                </div>

                <p v-if="index === 0 && margin" class="text-xs text-muted text-right"
                    :title="margin.description">
                    {{ margin.text }}
                </p>
            </div>
        </div>
    </UPageCard>
</template>

<script setup lang="ts">
import type {
    ComputedElectorateResult, ElectionSummary, ReferenceElectorate, ResultsVersion,
} from '~/types/elections'
import { describeMargin, formatCount } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: ReferenceElectorate
    result?: ComputedElectorateResult | null
}>()

const to = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates/${props.electorate.number}`)

/**
 * The top two, whether or not they are separable.
 *
 * `leaders` describes the count rather than naming a winner, so a tied seat
 * still shows both names and both figures; the margin line below says what
 * `firstPlace` being null means.
 */
const leaders = computed(() => props.result?.leaders ?? [])

/** The lead, written between the two figures it is the difference of. */
const margin = computed(() => (props.result && leaders.value.length >= 2
    ? describeMargin(props.result)
    : null))

const emptyMessage = computed(() => {
    if (!props.electorate.accepting_candidate_votes) return 'No candidate election was held.'
    return 'No candidate results yet.'
})
</script>
