<template>
    <UPageCard :to="to" variant="subtle" class="h-full">
        <div class="flex items-start justify-between gap-2">
            <!-- The card is a link in its own right, so nothing inside it is. -->
            <ElectionsEntityElectorateBadge :election="election" :resultsVersion="resultsVersion"
                :electorate="electorate.number" :link="false" />

            <!-- Blank where the seat was not curated, which is every archived
                 election: a seat says nothing about how it was held rather
                 than guessing at it. -->
            <UBadge v-if="seatChange" :color="seatChange.flipped ? 'primary' : 'neutral'"
                variant="subtle" size="sm" class="uppercase tracking-wide shrink-0"
                :title="seatChange.description">
                {{ seatChange.label }}
            </UBadge>
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
import { useIncumbency } from '~/composables/useIncumbency'
import { formatCount, formatPoints } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: ReferenceElectorate
    result?: ComputedElectorateResult | null
}>()

const { seatChangeBadgeFor } = useIncumbency(() => props.election, () => props.resultsVersion)

const to = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates/${props.electorate.number}`)

const seatChange = computed(() => seatChangeBadgeFor(props.electorate.number))

/**
 * The top two, whether or not they are separable.
 *
 * `leaders` describes the count rather than naming a winner, so a tied seat
 * still shows both names and both figures; the margin line below says what
 * `firstPlace` being null means.
 */
const leaders = computed(() => props.result?.leaders ?? [])

/**
 * The lead, written between the two figures it is the difference of.
 *
 * Short enough to sit in that gap, and spelled out in the title: "+12,151" is
 * clear where it stands and cryptic read on its own.
 */
const margin = computed(() => {
    const result = props.result
    if (!result || leaders.value.length < 2) return null

    if (result.resultStatus === 'indeterminate') {
        return { text: 'Tied', description: 'The leading candidates are tied.' }
    }
    if (result.margin === null) return null

    const votes = formatCount(result.margin)
    const points = formatPoints(result.marginPercentage)
    return {
        text: `+${votes}`,
        description: points
            ? `Margin of ${votes} votes (${points}).`
            : `Margin of ${votes} votes.`,
    }
})

const emptyMessage = computed(() => {
    if (!props.electorate.accepting_candidate_votes) return 'No candidate election was held.'
    return 'No candidate results yet.'
})
</script>
