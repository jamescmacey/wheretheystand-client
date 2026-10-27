<template>
    <div>
        <ElectionsResultsEmpty v-if="!results" title="No national results yet"
            description="National party vote totals have not been reported yet." />
        <template v-else>
            <UCard variant="soft">
                <ElectionsResultsTable :columns="columns" :rows="rows" :totals="totals" :bar-max="barMax">
                    <template #lead-header>
                        <USwitch v-model="showAll" size="sm" label="Show all parties" />
                    </template>
                </ElectionsResultsTable>
            </UCard>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { useSeatAllocation } from '~/composables/useSeatAllocation'
import { formatCount, formatPercent } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()

// Seats come from our own allocation rather than the columns the feed carries.
// The reader can change the threshold and the formula, and every seat number in
// the dashboard has to move together when they do -- a table here disagreeing
// with the House page would be worse than either being wrong on its own.
const { allocation } = useSeatAllocation(() => props.election, () => props.resultsVersion)

const seatsFor = (party: number | null) => {
    if (party === null || !allocation.value) return { electorate: 0, list: 0, total: 0 }
    return {
        electorate: allocation.value.electorateSeats.get(party) ?? 0,
        list: allocation.value.listSeats.get(party) ?? 0,
        total: allocation.value.totalSeats.get(party) ?? 0,
    }
}

/** Parties below this share are hidden unless the reader asks for them. */
const MINOR_PARTY_THRESHOLD = 0.5

const showAll = ref(false)

const results = computed(() =>
    store.nationalResults(props.election.slug, props.resultsVersion.slug, 'party_votes'))

const columns: ResultsColumn[] = [
    { key: 'electorate_seats', label: 'Elec.', width: '4rem', secondary: true },
    { key: 'list_seats', label: 'List', width: '4rem', secondary: true },
    { key: 'total_seats', label: 'Total', width: '4rem', emphasis: true },
    { key: 'count', label: 'Votes', width: '6rem' },
    { key: 'share', label: 'Share', width: '5rem' },
]

// A copy before sorting: this array lives in the store, and sorting in place
// would mutate shared state during render and reorder it for every other view.
const ordered = computed(() =>
    [...(results.value?.results ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)))

const visible = computed(() => ordered.value.filter(result =>
    showAll.value
    || seatsFor(result.party).total > 0
    || (result.per_cent ?? 0) >= MINOR_PARTY_THRESHOLD))

const barMax = computed(() =>
    Math.max(10, ...ordered.value.map(result => result.per_cent ?? 0)))

const rows = computed<ResultsRow[]>(() => visible.value.map(result => {
    const party = result.party === null
        ? null
        : store.party(props.election.slug, props.resultsVersion.slug, result.party)
    const seats = seatsFor(result.party)
    return {
        key: result.party ?? `unknown-${result.count}`,
        label: party?.name ?? 'Unknown party',
        colour: store.partyColour(props.election.slug, props.resultsVersion.slug, result.party),
        bar: result.per_cent,
        cells: {
            electorate_seats: seats.electorate,
            list_seats: seats.list,
            total_seats: seats.total,
            count: formatCount(result.count),
            share: formatPercent(result.per_cent),
        },
    }
}))

const sum = (pick: (result: (typeof ordered.value)[number]) => number | null) =>
    ordered.value.reduce((total, result) => total + (pick(result) ?? 0), 0)

const seatTotals = computed(() => ordered.value.reduce((totals, result) => {
    const seats = seatsFor(result.party)
    return {
        electorate: totals.electorate + seats.electorate,
        list: totals.list + seats.list,
        total: totals.total + seats.total,
    }
}, { electorate: 0, list: 0, total: 0 }))

const totals = computed(() => ({
    label: 'Totals',
    note: null,
    cells: {
        electorate_seats: seatTotals.value.electorate,
        list_seats: seatTotals.value.list,
        total_seats: seatTotals.value.total,
        count: formatCount(results.value?.statistics.total_votes_cast ?? sum(result => result.count)),
        share: null,
    },
}))

</script>
