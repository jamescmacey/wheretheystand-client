<template>
    <div>
        <ElectionsResultsEmpty v-if="!results" title="No national results yet"
            description="National party vote totals have not been reported yet." />
        <template v-else>
            <UCard variant="soft">
                <ElectionsResultsTable :columns="columns" :rows="rows" :totals="totals"
                    :informals="informals" :show-bars="showBars">
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
import { useComparison } from '~/composables/useComparison'
import { formatCount, formatPercent } from '~/utils/elections/format'

const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    /** Off where the card shares its row and the figures carry the comparison. */
    showBars?: boolean
}>(), { showBars: true })

const store = useElectionDataStore()

// Seats come from our own allocation rather than the columns the feed carries.
// The reader can change the threshold and the formula, and every seat number in
// the dashboard has to move together when they do -- a table here disagreeing
// with the Parliament page would be worse than either being wrong on its own.
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

// The last election's share, on the far right and muted, where this version
// is compared against one.
const { column: comparisonColumn, nationalPartyShare } = useComparison(
    () => props.election, () => props.resultsVersion)

const columns = computed<ResultsColumn[]>(() => [
    { key: 'electorate_seats', label: 'Elec.', width: '4rem', secondary: true },
    { key: 'list_seats', label: 'List', width: '4rem', secondary: true },
    { key: 'total_seats', label: 'Total', width: '4rem', emphasis: true },
    { key: 'count', label: 'Votes', width: '6rem' },
    { key: 'share', label: 'Share', width: '5rem' },
    ...(comparisonColumn.value ? [comparisonColumn.value] : []),
])

// A copy before sorting: this array lives in the store, and sorting in place
// would mutate shared state during render and reorder it for every other view.
const ordered = computed(() =>
    [...(results.value?.results ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)))

const visible = computed(() => ordered.value.filter(result =>
    showAll.value
    || seatsFor(result.party).total > 0
    || (result.per_cent ?? 0) >= MINOR_PARTY_THRESHOLD))

const rows = computed<ResultsRow[]>(() => visible.value.map(result => {
    const party = result.party === null
        ? null
        : store.party(props.election.slug, props.resultsVersion.slug, result.party)
    const seats = seatsFor(result.party)
    return {
        key: result.party ?? `unknown-${result.count}`,
        label: party?.name ?? 'Unknown party',
        colour: store.partyColour(props.election.slug, props.resultsVersion.slug, result.party),
        alternateColour: store.partyAlternateColour(
            props.election.slug, props.resultsVersion.slug, result.party),
        bar: result.per_cent,
        cells: {
            electorate_seats: seats.electorate,
            list_seats: seats.list,
            total_seats: seats.total,
            count: formatCount(result.count),
            share: formatPercent(result.per_cent),
            comparison: formatPercent(nationalPartyShare(result.party)),
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
        // Valid votes only, so the figure is the sum of the rows above it.
        // `total_votes_cast` includes informals.
        count: formatCount(sum(result => result.count)),
        share: null,
    },
}))

/**
 * From the national tally only, never summed from the electorates.
 *
 * The feed's national set can leave both informal fields null -- the 2023
 * final results do -- so the count falls back to votes cast less the valid
 * votes in the rows.
 */
const informals = computed(() => {
    const cast = results.value?.statistics.total_votes_cast ?? null
    const derived = cast === null ? null : cast - sum(result => result.count)
    const count = results.value?.informals
        ?? results.value?.statistics.total_party_informals
        ?? (derived !== null && derived >= 0 ? derived : null)
    return count === null
        ? null
        : { label: 'Informal votes', cells: { count: formatCount(count) } }
})

</script>
