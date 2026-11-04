<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">{{ heading }}</h3>
        </template>

        <ElectionsResultsEmpty v-if="!results" :title="`No ${noun} yet`"
            :description="`${headingNoun} for this electorate have not been reported yet.`" />
        <template v-else>
            <ElectionsResultsTable :columns="columns" :rows="rows" :totals="footer.totals"
                :informals="footer.informals"
                lead-width="minmax(9rem, 18rem)">
                <template v-if="isCandidates" #cell-comparison="{ row }">
                    <ElectionsResultsComparisonCell :figures="figuresFor(row.key)" />
                </template>
            </ElectionsResultsTable>

            <!-- Only the icons the table actually shows. -->
            <ul v-if="keyEntries.length" class="mt-3 space-y-1 text-xs text-muted">
                <li v-for="entry in keyEntries" :key="entry.basis" class="flex items-center gap-1.5">
                    <UIcon :name="entry.icon" class="size-3.5 shrink-0" aria-hidden="true" />
                    {{ entry.text }}
                </li>
            </ul>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ResultsCategory, ResultsVersion,
} from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { useIncumbency } from '~/composables/useIncumbency'
import { useComparison } from '~/composables/useComparison'
import { COMPARISON_ICONS, type CandidateComparisonFigure } from '~/utils/elections/comparison'
import { formatPercent } from '~/utils/elections/format'
import {
    RESULTS_COLUMNS, buildResultsFooter, buildResultsRows,
} from '~/utils/elections/rows'

/**
 * Candidate or party results within one electorate.
 *
 * Replaces two near-identical components that differed only in which entity
 * labelled the row.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
    category: ResultsCategory
}>()

const store = useElectionDataStore()
const { incumbentFor } = useIncumbency(() => props.election, () => props.resultsVersion)

const isCandidates = computed(() => props.category === 'candidate_votes')
const noun = computed(() => (isCandidates.value ? 'candidate votes' : 'party votes'))
const headingNoun = computed(() => (isCandidates.value ? 'Candidate votes' : 'Party votes'))
const heading = computed(() => headingNoun.value)

const results = computed(() => store.electorateResults(
    props.election.slug, props.resultsVersion.slug, props.electorate, props.category))

const {
    column: comparisonColumn, label: comparisonLabel, electoratePartyShare, candidateFigures,
} = useComparison(() => props.election, () => props.resultsVersion)

const columns = computed<ResultsColumn[]>(() => [
    ...RESULTS_COLUMNS,
    ...(comparisonColumn.value ? [comparisonColumn.value] : []),
])

/**
 * What each candidate is measured against last time, by candidate number.
 *
 * Worked out once per render rather than per cell, because the key below the
 * table needs to know which icons appear before it can say what they mean.
 */
const figuresByCandidate = computed(() => {
    const figures = new Map<number, CandidateComparisonFigure[]>()
    if (!isCandidates.value || !comparisonColumn.value) return figures
    for (const result of results.value?.results ?? []) {
        if (result.candidate === null) continue
        figures.set(result.candidate, candidateFigures(props.electorate, result.candidate))
    }
    return figures
})

const figuresFor = (key: string | number) =>
    (typeof key === 'number' ? figuresByCandidate.value.get(key) ?? [] : [])

const keyEntries = computed(() => {
    const shown = new Set<string>()
    for (const figures of figuresByCandidate.value.values()) {
        for (const figure of figures) shown.add(figure.basis)
    }
    const year = comparisonLabel.value
    // In the order a stacked cell shows them: the candidate's own figure first.
    return [
        {
            basis: 'candidate',
            icon: COMPARISON_ICONS.candidate,
            text: `This candidate's share in ${year}, when they stood for a different party or as an independent.`,
        },
        {
            basis: 'party',
            icon: COMPARISON_ICONS.party,
            text: `The share won by this party's candidate in ${year}, who was a different person.`,
        },
    ].filter(entry => shown.has(entry.basis))
})

// Shared with the voting place card, so the two cannot drift on party colours,
// the independent sublabel or the informals line.
const rows = computed<ResultsRow[]>(() => {
    const built = buildResultsRows({
        store,
        election: props.election,
        resultsVersion: props.resultsVersion,
        category: props.category,
        results: results.value?.results ?? [],
    })

    // The party's share of this electorate's party vote last time. Candidate
    // rows fill the same column through the cell slot, since theirs carry icons.
    const compared = !isCandidates.value && comparisonColumn.value
        ? built.map(row => ({
            ...row,
            cells: {
                ...row.cells,
                comparison: formatPercent(electoratePartyShare(
                    props.electorate, typeof row.key === 'number' ? row.key : null)),
            },
        }))
        : built

    // Which of these names is the one already holding the seat. Marked here
    // rather than in the shared row builder, because it is true of a candidate
    // in their own electorate and not of the same candidate's tally at one
    // voting place within it.
    const incumbent = isCandidates.value ? incumbentFor(props.electorate) : null
    if (!incumbent?.candidate) return compared

    return compared.map((row) => {
        if (typeof row.key !== 'number') return row
        const persistent = store.persistentCandidateFor(
            props.election.slug, props.resultsVersion.slug, row.key)
        if (persistent?.id !== incumbent.candidate) return row
        return {
            ...row,
            sublabel: [row.sublabel, 'Sitting member'].filter(Boolean).join(' · '),
        }
    })
})

const footer = computed(() => buildResultsFooter({
    results: results.value?.results ?? [],
    informals: results.value?.informals ?? null,
}))
</script>
