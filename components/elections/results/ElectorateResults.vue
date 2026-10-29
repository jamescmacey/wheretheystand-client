<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">{{ heading }}</h3>
        </template>

        <ElectionsResultsEmpty v-if="!results" :title="`No ${noun} yet`"
            :description="`${headingNoun} for this electorate have not been reported yet.`" />
        <ElectionsResultsTable v-else :columns="columns" :rows="rows" :totals="totals" :bar-max="barMax"
            lead-width="minmax(9rem, 18rem)" />
    </UCard>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ResultsCategory, ResultsVersion,
} from '~/types/elections'
import type { ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { useIncumbency } from '~/composables/useIncumbency'
import { formatCount } from '~/utils/elections/format'
import {
    RESULTS_COLUMNS, barMaxForRows, buildResultsRows,
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

const columns = RESULTS_COLUMNS

const totalVotes = computed(() =>
    results.value?.statistics.total_votes_cast
    ?? (results.value?.results ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0))

// Shared with the voting place card, so the two cannot drift on party colours,
// the independent sublabel or the informals line.
const rows = computed<ResultsRow[]>(() => {
    const built = buildResultsRows({
        store,
        election: props.election,
        resultsVersion: props.resultsVersion,
        category: props.category,
        results: results.value?.results ?? [],
        totalVotes: totalVotes.value,
        informals: results.value?.informals ?? null,
    })

    // Which of these names is the one already holding the seat. Marked here
    // rather than in the shared row builder, because it is true of a candidate
    // in their own electorate and not of the same candidate's tally at one
    // voting place within it.
    const incumbent = isCandidates.value ? incumbentFor(props.electorate) : null
    if (!incumbent?.candidate) return built

    return built.map((row) => {
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

const barMax = computed(() => barMaxForRows(rows.value))

const totals = computed(() => ({
    label: 'Total votes cast',
    note: null,
    cells: { count: formatCount(totalVotes.value), share: null },
}))
</script>
