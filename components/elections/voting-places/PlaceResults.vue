<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="font-bold">{{ heading }}</h3>
                <UBadge v-if="aggregate.isFinal" variant="subtle" color="neutral" size="sm">
                    Final
                </UBadge>
            </div>
        </template>

        <ElectionsResultsEmpty v-if="!aggregate.sets.length" :title="`No ${noun} yet`"
            :description="emptyDescription" />

        <template v-else>
            <ElectionsResultsTable :columns="columns" :rows="rows" :totals="totals" :bar-max="barMax"
                lead-width="minmax(9rem, 18rem)" />

            <p class="mt-3 text-sm text-muted">{{ provenance }}</p>

            <!-- Where a place reported more than once for one electorate, the
                 components are worth showing: the combined figure above is the
                 answer, but it is not what any single report said. The
                 Commission gives the reports no names, so they are listed by
                 number and by when each was last updated rather than labelled
                 as advance or polling day, which the data does not say. -->
            <div v-if="splitReports.length" class="mt-3">
                <UCollapsible>
                    <UButton variant="link" color="neutral" size="sm" class="p-0"
                        trailing-icon="i-lucide-chevron-down">
                        Show the {{ splitReports.length }} separate reports
                    </UButton>

                    <template #content>
                        <ul class="mt-2 flex flex-col gap-1 text-sm text-muted">
                            <li v-for="report in splitReports" :key="report.key"
                                class="flex flex-wrap items-baseline gap-x-2">
                                <span class="text-default">{{ report.label }}</span>
                                <span class="tabular-nums">{{ report.count }}</span>
                                <span v-if="report.updated" class="text-xs">
                                    as at {{ report.updated }}
                                </span>
                            </li>
                        </ul>
                    </template>
                </UCollapsible>
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ResultsCategory, ResultsSet, ResultsVersion,
} from '~/types/elections'
import type { ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { aggregateResultsSets } from '~/utils/elections/aggregate'
import { formatCount, formatTime, fromEpochSeconds, pluralise } from '~/utils/elections/format'
import { RESULTS_COLUMNS, barMaxForRows, buildResultsRows } from '~/utils/elections/rows'

/**
 * What one voting place counted, combined across whatever reported it.
 *
 * Always an aggregate, however many sets it is handed. A place issues ballots
 * for several electorates, and may report more than once for one of them, so a
 * single set is the exception rather than the rule -- and a card that picked
 * one out of the list would understate the place by the rest.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    /** Every set to combine. Already narrowed to the chosen electorates. */
    sets: ResultsSet[]
    category: ResultsCategory
    heading: string
}>()

const store = useElectionDataStore()

const isCandidates = computed(() => props.category === 'candidate_votes')
const noun = computed(() => (isCandidates.value ? 'candidate votes' : 'party votes'))

const emptyDescription = computed(() => (
    `${isCandidates.value ? 'Candidate votes' : 'Party votes'} counted at this `
    + 'voting place have not been reported yet.'
))

/*
 * Candidate votes are never summed across electorates: the sets name different
 * candidates, so adding them would invent a contest that was never held. The
 * page only ever passes one electorate's sets for this category, and this is
 * the guard rather than a reliance on that.
 */
const usable = computed(() => {
    if (!isCandidates.value) return props.sets

    const electorates = new Set(
        props.sets.map(set => set.electorate).filter(value => value !== null))
    if (electorates.size <= 1) return props.sets

    const first: EntityNumber | null = props.sets[0]?.electorate ?? null
    console.warn(
        '[elections] candidate votes cannot be combined across electorates; '
        + `showing ${first} only`)
    return props.sets.filter(set => set.electorate === first)
})

const aggregate = computed(() => aggregateResultsSets(usable.value, props.category))

const columns = RESULTS_COLUMNS

const rows = computed<ResultsRow[]>(() => buildResultsRows({
    store,
    election: props.election,
    resultsVersion: props.resultsVersion,
    category: props.category,
    results: aggregate.value.results,
    totalVotes: aggregate.value.totalVotes,
    informals: aggregate.value.informals,
}))

const barMax = computed(() => barMaxForRows(rows.value))

const totals = computed(() => ({
    label: 'Total votes cast',
    note: null,
    cells: { count: formatCount(aggregate.value.totalVotes), share: null },
}))

/** What went into the figure, said rather than left for the reader to assume. */
const provenance = computed(() => {
    const { electorates, sets, isFinal } = aggregate.value

    const parts = [
        electorates.length > 1
            ? `Combined across ${pluralise(electorates.length, 'electorate')}`
            : 'One electorate',
    ]

    if (sets.length > electorates.length) {
        parts.push(`from ${pluralise(sets.length, 'separate report')}`)
    }

    const sentence = `${parts.join(' ')}.`

    return isFinal
        ? sentence
        : `${sentence} Counting was not complete in every one of them.`
})

/**
 * The individual reports, where an electorate was reported more than once.
 *
 * Empty in the ordinary case, which is what keeps the breakdown out of the way
 * until there is something to break down.
 */
const splitReports = computed(() => {
    const byElectorate = new Map<string, ResultsSet[]>()
    for (const set of aggregate.value.sets) {
        const key = String(set.electorate ?? '-')
        const held = byElectorate.get(key)
        if (held) held.push(set)
        else byElectorate.set(key, [set])
    }

    const reports: Array<{ key: string, label: string, count: string | null, updated: string | null }> = []
    for (const [electorate, group] of byElectorate) {
        if (group.length < 2) continue

        const name = electorate === '-'
            ? 'Unknown electorate'
            : store.electorate(props.election.slug, props.resultsVersion.slug, Number(electorate))
                ?.name ?? `Electorate ${electorate}`

        group.forEach((set, index) => {
            const counted = set.results.reduce((sum, result) => sum + (result.count ?? 0), 0)
                + (set.informals ?? 0)
            reports.push({
                key: set.key,
                label: `${name}, report ${set.result_number ?? index + 1}`,
                count: formatCount(counted),
                updated: formatTime(fromEpochSeconds(set.updated_timestamp)),
            })
        })
    }

    return reports
})
</script>
