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
import { useBlocOrder } from '~/composables/useBlocOrder'
import { useIncumbency } from '~/composables/useIncumbency'
import { formatCount, pluralise } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { order } = useBlocOrder(() => props.election, () => props.resultsVersion)
const { curated, seatChangeNoteFor, withDefendingParties } = useIncumbency(
    () => props.election, () => props.resultsVersion)

const columns = computed<ResultsColumn[]>(() => {
    const base: ResultsColumn[] = [
        { key: 'entitlement', label: 'Due', width: '4rem', secondary: true },
        { key: 'electorate', label: 'Elec.', width: '4rem', secondary: true },
        { key: 'list', label: 'List', width: '4rem', secondary: true },
        { key: 'total', label: 'Seats', width: '5rem', emphasis: true },
    ]

    // Only where seats held have been curated. Every archived election would
    // otherwise gain a column of em dashes saying nothing.
    if (curated.value) base.push({ key: 'change', label: 'Change', width: '5rem' })
    return base
})

// Every party holding a seat, whether or not it qualified for list seats: an
// electorate winner from a party under the threshold still sits. Ordered by
// bloc so the table reads in the same order as the chamber above it, and by
// size where no blocs have been curated.
//
// A party that held seats and won none is carried at zero rather than dropped,
// because a table of what changed that omits the parties that lost everything
// answers the question least well exactly where it matters most.
const seated = computed(() => order(withDefendingParties(
    [...props.allocation.totalSeats.entries()].filter(([, seats]) => seats > 0))))

const barMax = computed(() =>
    Math.max(1, ...seated.value.map(([, seats]) => seats)))

const rows = computed<ResultsRow[]>(() => seated.value.map(([party, total]) => {
    const overhang = props.allocation.overhangByParty.get(party) ?? 0
    const change = seatChangeNoteFor(party, total)
    return {
        key: party,
        label: store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party',
        sublabel: overhang > 0 ? `Overhang of ${pluralise(overhang, 'seat')}` : null,
        colour: store.partyColour(slugs.value.e, slugs.value.v, party),
        // A party out of the House is greyed, because every other row is a
        // party that is in it.
        muted: total === 0,
        bar: total,
        cells: {
            entitlement: props.allocation.entitlement.get(party) ?? 0,
            electorate: props.allocation.electorateSeats.get(party) ?? 0,
            list: props.allocation.listSeats.get(party) ?? 0,
            total,
            // The compact form: the column is right aligned and three
            // characters wide, so "3 fewer" has nowhere to go.
            change: change?.label ?? null,
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
    const text = parts.join(', ')

    // The change column is a bare figure, so the baseline has to be stated
    // somewhere a reader will find it rather than left to be inferred.
    return curated.value
        ? `${text}. Change is against the seats held going into the election.`
        : text
})
</script>
