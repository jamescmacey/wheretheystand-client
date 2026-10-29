<template>
    <div v-if="seats.length">
        <svg :viewBox="`0 0 ${box.width} ${box.height}`" class="w-full h-auto" role="img"
            :aria-label="label">
            <circle v-for="seat in seats" :key="seat.key" :cx="seat.x" :cy="seat.y" :r="RADIUS"
                :fill="seat.colour" :stroke="seat.filled ? 'none' : 'currentColor'"
                :stroke-dasharray="seat.filled ? undefined : '2 2'"
                :fill-opacity="seat.filled ? 1 : 0.15" class="text-muted">
                <title>{{ seat.title }}</title>
            </circle>
            <!-- Where a majority begins. Drawn last so it sits over the seats. -->
            <line :x1="box.width / 2" :y1="box.baseline - INNER_RADIUS + ROW_GAP"
                :x2="box.width / 2" :y2="box.baseline - box.maxRadius - RADIUS * 2"
                stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"
                class="text-inverted/60" />
        </svg>
        <p class="mt-2 text-sm text-muted">{{ label }}</p>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore, DEFAULT_PARTY_COLOUR } from '~/stores/electionData'
import { useBlocOrder } from '~/composables/useBlocOrder'
import { pluralise } from '~/utils/elections/format'

/**
 * Parliament as a seating plan.
 *
 * A seat per member rather than a bar per party, because the question people
 * actually ask of a result -- who can govern together -- is easier to see as a
 * shape than as a column of numbers. Seats are laid out in rows within a
 * semicircle, ordered left to right by bloc, so the parties likely to work
 * together read as one block.
 *
 * Where no blocs have been curated for the version the order falls back to
 * size, which is how every archived election is drawn.
 *
 * Unfilled seats -- a party entitled to more list seats than it has candidates
 * left, or an electorate still tied -- are drawn hollow rather than omitted.
 * The seat exists; it just has nobody in it yet. They sit in the middle with
 * the cross-bench rather than at one end: a seat belonging to nobody would
 * otherwise pad whichever bloc sits on that edge and make it read as larger
 * than the count supports.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { order, unalignedIndex } = useBlocOrder(
    () => props.election, () => props.resultsVersion)

const INNER_RADIUS = 150
const ROW_GAP = 40
const RADIUS = 9
const PADDING = 12

interface Seat {
    key: string
    x: number
    y: number
    colour: string
    filled: boolean
    title: string
}

/** One entry per seat, from the far left of the chamber to the far right. */
const ordered = computed(() => {
    const entries = order([...props.allocation.totalSeats.entries()]
        .filter(([, seats]) => seats > 0))

    const list: { party: EntityNumber | null, filled: boolean }[] = []
    for (const [party, seats] of entries) {
        for (let index = 0; index < seats; index += 1) list.push({ party, filled: true })
    }

    // Seats that exist but have nobody in them. Spliced in where the right
    // bloc begins, so they land in the middle rather than padding an edge; with
    // no blocs curated that index is the end, as it always was.
    const empty = props.allocation.unfilled + props.allocation.undecidedElectorates.length
    if (!empty) return list

    const hollow = Array.from({ length: empty },
        () => ({ party: null as EntityNumber | null, filled: false }))
    const seatsBefore = entries
        .slice(0, unalignedIndex(entries))
        .reduce((sum, [, seats]) => sum + seats, 0)
    list.splice(seatsBefore, 0, ...hollow)
    return list
})

/**
 * Rows, sized so that seats stay a readable size as the House grows.
 *
 * Rows further out are longer, so each takes a share of the seats proportional
 * to its radius -- otherwise the inner rows are crowded and the outer ones
 * sparse.
 */
const rows = computed(() => {
    const total = ordered.value.length
    if (!total) return []

    const count = Math.max(2, Math.min(6, Math.ceil(total / 26)))
    const radii = Array.from({ length: count }, (_, row) => INNER_RADIUS + row * ROW_GAP)
    const weight = radii.reduce((sum, radius) => sum + radius, 0)

    const perRow = radii.map(radius => Math.max(1, Math.round((radius / weight) * total)))

    // Rounding can overshoot or undershoot; settle the difference on the
    // outermost row, which has the most room to absorb it.
    const last = perRow.length - 1
    const drift = total - perRow.reduce((sum, seats) => sum + seats, 0)
    perRow[last] = Math.max(1, (perRow[last] ?? 0) + drift)

    return radii.map((radius, index) => ({ radius, seats: Math.max(0, perRow[index] ?? 0) }))
})

/** The viewBox has to hold the outermost row, or its ends are clipped off. */
const box = computed(() => {
    const maxRadius = rows.value.length
        ? Math.max(...rows.value.map(row => row.radius))
        : INNER_RADIUS
    const half = maxRadius + RADIUS + PADDING
    return { width: half * 2, height: half + RADIUS + PADDING, baseline: half, maxRadius }
})

/**
 * Seats, ordered around the arc rather than along each row in turn.
 *
 * Filling one row at a time scatters a party across the whole semicircle: its
 * members end up at whatever angles happen to fall in that row. Sorting every
 * position by angle first makes each party a contiguous wedge, which is the
 * only reason to draw a chamber rather than a bar chart -- who could govern
 * with whom is a question about which blocks sit next to each other.
 */
const seats = computed<Seat[]>(() => {
    const positions: { angle: number, radius: number }[] = []

    for (const row of rows.value) {
        for (let index = 0; index < row.seats; index += 1) {
            // A single seat in a row sits at the top rather than at one end.
            const t = row.seats === 1 ? 0.5 : index / (row.seats - 1)
            positions.push({ angle: Math.PI - t * Math.PI, radius: row.radius })
        }
    }

    // Left to right, innermost first where two share an angle.
    positions.sort((a, b) => b.angle - a.angle || a.radius - b.radius)

    const { width, baseline } = box.value

    return positions.map((position, index) => {
        const seat = ordered.value[index]
        return {
            key: `${index}`,
            x: width / 2 + Math.cos(position.angle) * position.radius,
            y: baseline - Math.sin(position.angle) * position.radius,
            colour: !seat || seat.party === null
                ? DEFAULT_PARTY_COLOUR
                : store.partyColour(slugs.value.e, slugs.value.v, seat.party),
            filled: seat?.filled ?? false,
            title: !seat || seat.party === null
                ? 'Seat not yet filled'
                : store.party(slugs.value.e, slugs.value.v, seat.party)?.name ?? 'Unknown party',
        }
    })
})

const majority = computed(() => Math.floor(props.allocation.houseSize / 2) + 1)

const label = computed(() =>
    `${pluralise(props.allocation.houseSize, 'seat')} · ${majority.value} needed to govern`)
</script>
