<template>
    <UCard variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Seats</h3>
                <p class="text-sm text-muted">{{ summary }}</p>
            </div>
        </template>
        <ElectionsResultsTable :columns="columns" :rows="rows" :totals="totals" :bar-max="barMax" />
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore } from '~/stores/electionData'
import { formatCount, pluralise } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const columns: ResultsColumn[] = [
    { key: 'entitlement', label: 'Due', width: '4rem', secondary: true },
    { key: 'electorate', label: 'Elec.', width: '4rem', secondary: true },
    { key: 'list', label: 'List', width: '4rem', secondary: true },
    { key: 'total', label: 'Seats', width: '5rem', emphasis: true },
]

// Every party holding a seat, whether or not it qualified for list seats: an
// electorate winner from a party under the threshold still sits.
const seated = computed(() => [...props.allocation.totalSeats.entries()]
    .filter(([, seats]) => seats > 0)
    .sort((a, b) => b[1] - a[1]))

const barMax = computed(() =>
    Math.max(1, ...seated.value.map(([, seats]) => seats)))

const rows = computed<ResultsRow[]>(() => seated.value.map(([party, total]) => {
    const overhang = props.allocation.overhangByParty.get(party) ?? 0
    return {
        key: party,
        label: store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party',
        sublabel: overhang > 0 ? `Overhang of ${pluralise(overhang, 'seat')}` : null,
        colour: store.partyColour(slugs.value.e, slugs.value.v, party),
        bar: total,
        cells: {
            entitlement: props.allocation.entitlement.get(party) ?? 0,
            electorate: props.allocation.electorateSeats.get(party) ?? 0,
            list: props.allocation.listSeats.get(party) ?? 0,
            total,
        },
    }
}))

const totals = computed(() => ({
    label: 'Total',
    note: null,
    cells: {
        entitlement: [...props.allocation.entitlement.values()].reduce((a, b) => a + b, 0),
        electorate: [...props.allocation.electorateSeats.values()].reduce((a, b) => a + b, 0),
        list: [...props.allocation.listSeats.values()].reduce((a, b) => a + b, 0),
        total: formatCount(props.allocation.houseSize),
    },
}))

const summary = computed(() => {
    const parts = [pluralise(props.allocation.houseSize, 'seat')]
    if (props.allocation.overhang > 0) {
        parts.push(`including an overhang of ${pluralise(props.allocation.overhang, 'seat')}`)
    }
    return parts.join(', ')
})
</script>
