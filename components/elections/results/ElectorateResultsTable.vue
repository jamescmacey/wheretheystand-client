<template>
    <UCard variant="subtle" :ui="{ body: 'p-0 sm:p-0' }">
        <!-- Only shown where it fits. Scrolling within itself covers a name longer
             than any it was sized against, so the page never scrolls sideways. -->
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-left text-muted">
                    <tr class="border-b border-default">
                        <th scope="col" class="px-4 py-2 font-medium">Electorate</th>
                        <th scope="col" class="px-2 py-2 font-medium"><span class="sr-only">Change</span></th>
                        <th scope="col" class="px-2 py-2 font-medium">Leading</th>
                        <th scope="col" class="px-2 py-2 font-medium">Trailing</th>
                        <th scope="col" class="px-4 py-2 font-medium text-right">Margin</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-default">
                    <tr v-for="row in rows" :key="row.electorate.number">
                        <td class="px-4 py-2">
                            <ElectionsEntityElectorateBadge :election="election" :resultsVersion="resultsVersion"
                                :electorate="row.electorate.number" />
                        </td>
                        <td class="px-2 py-2 whitespace-nowrap">
                            <ElectionsResultsSeatChangeBadge :election="election" :resultsVersion="resultsVersion"
                                :electorate="row.electorate.number" />
                        </td>
                        <td v-if="!row.leaders.length" colspan="3" class="px-2 py-2 text-muted">
                            {{ row.emptyMessage }}
                        </td>
                        <template v-else>
                            <!-- The count leads, hard against its own candidate, so it
                                 cannot be read as belonging to the next column. -->
                            <td v-for="index in [0, 1]" :key="index" class="px-2 py-2">
                                <div v-if="row.leaders[index]" class="flex items-center gap-3">
                                    <span class="tabular-nums font-medium shrink-0 min-w-[3.25rem] text-right">
                                        {{ formatCount(row.leaders[index]!.count) }}
                                    </span>
                                    <ElectionsEntityCandidateLabel :link="false" :election="election"
                                        :resultsVersion="resultsVersion"
                                        :candidate="row.leaders[index]!.candidate" />
                                </div>
                            </td>
                            <td class="px-4 py-2 text-right tabular-nums whitespace-nowrap"
                                :title="row.margin?.description">
                                {{ row.margin?.text }}
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type {
    ComputedElectorateResult, ElectionSummary, EntityNumber, ReferenceElectorate, ResultsVersion,
} from '~/types/elections'
import { describeMargin, formatCount } from '~/utils/elections/format'

/**
 * The electorates page's compact view: the same figures as the cards, one line
 * per seat, for a reader comparing many of them.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorates: ReferenceElectorate[]
    resultFor: (number: EntityNumber) => ComputedElectorateResult | null
}>()

const rows = computed(() => props.electorates.map((electorate) => {
    const result = props.resultFor(electorate.number)
    const leaders = result?.leaders ?? []
    return {
        electorate,
        leaders,
        margin: result && leaders.length >= 2 ? describeMargin(result) : null,
        emptyMessage: electorate.accepting_candidate_votes
            ? 'No candidate results yet.'
            : 'No candidate election was held.',
    }
}))
</script>
