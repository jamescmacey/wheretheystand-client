<template>
    <div v-if="seats.length">
        <!-- Capped at the viewBox's own width, so a dot never draws larger
             than it was designed at. Without it a wide panel scales the whole
             block up and the seats become saucers. -->
        <svg :viewBox="`0 0 ${box.width} ${box.height}`" class="w-full h-auto mx-auto" role="img"
            :style="{ maxWidth: `${box.width}px` }" :aria-label="label">
            <circle v-for="seat in seats" :key="seat.key" :cx="seat.x" :cy="seat.y" :r="RADIUS"
                :fill="seat.colour" :stroke="seat.filled ? 'none' : 'currentColor'"
                :stroke-dasharray="seat.filled ? undefined : '2 2'"
                :fill-opacity="seat.filled ? 1 : 0.15" class="text-muted">
                <title>{{ seat.title }}</title>
            </circle>
            <!-- Where a majority begins. In the page's own text colour, because
                 it runs down the gap between two columns rather than over the
                 seats, and anything dimmer disappears into the background. -->
            <line :x1="majorityX" :y1="0" :x2="majorityX" :y2="box.height" stroke="currentColor"
                stroke-width="1.5" stroke-dasharray="4 3" class="text-default/70" />
        </svg>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore, DEFAULT_PARTY_COLOUR } from '~/stores/electionData'
import { useBlocOrder } from '~/composables/useBlocOrder'
import { pluralise } from '~/utils/elections/format'

/**
 * Parliament as a block of seats: one dot per member, in a rectangle.
 *
 * A seat per member rather than a bar per party, because the question people
 * actually ask of a result -- who can govern together -- is easier to see as a
 * shape than as a column of numbers. The dots are ordered left to right by
 * bloc, so the parties likely to work together read as one band, and filled
 * column by column so that each party's band is a solid rectangle rather than
 * a stripe running through every row.
 *
 * A grid rather than a semicircle: the rows of a semicircle are different
 * lengths, so the same number of seats takes a different amount of arc
 * depending on how far out it sits, and two parties of equal size do not look
 * equal. In a rectangle every dot occupies the same space, which is the whole
 * claim the drawing makes.
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

const RADIUS = 9
const PITCH = 24
const PADDING = 6

/**
 * How wide the block is against its height.
 *
 * A 120-seat House comes out six rows by twenty columns, which is close enough
 * to the proportions of a page that the dots stay a readable size on a phone
 * without the block becoming a thin strip on a desktop.
 */
const ASPECT = 3.3

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
 * Rows, the columns they need, and where the short column falls.
 *
 * A House rarely divides evenly into rows, so one column is always short. It
 * goes in the middle rather than at an end: a column of one dot hanging off
 * the right edge reads as a party sitting on its own, when it is only the
 * arithmetic of the grid. Putting the gap in the middle pushes each bloc hard
 * up against its own side, which is also where a chamber puts them.
 */
const grid = computed(() => {
    const total = ordered.value.length
    if (!total) return { rows: 0, columns: 0, blank: 0, middle: 0 }

    const rows = Math.max(2, Math.min(10, Math.round(Math.sqrt(total / ASPECT))))
    const columns = Math.ceil(total / rows)
    return {
        rows,
        columns,
        blank: columns * rows - total,
        middle: Math.floor(columns / 2),
    }
})

const box = computed(() => {
    const { rows, columns } = grid.value
    const span = (count: number) =>
        PADDING * 2 + RADIUS * 2 + Math.max(0, count - 1) * PITCH
    return { width: span(columns), height: span(rows) }
})

/**
 * Which cell the nth seat sits in, filling column by column.
 *
 * Row by row would scatter a party across the whole block, which is the one
 * arrangement that makes the drawing harder to read than the tiles above it.
 *
 * The left bloc fills from the left edge, the right bloc ends at the right
 * edge, and whatever is short of a full column sits in the middle, centred
 * between the rows so the gap reads as an aisle.
 */
function cellFor(index: number) {
    const { rows, blank, middle } = grid.value
    if (!blank) return { column: Math.floor(index / rows), row: index % rows }

    const before = middle * rows
    if (index < before) return { column: Math.floor(index / rows), row: index % rows }

    const inMiddle = rows - blank
    if (index < before + inMiddle) {
        return { column: middle, row: Math.floor(blank / 2) + (index - before) }
    }

    const after = index - before - inMiddle
    return { column: middle + 1 + Math.floor(after / rows), row: after % rows }
}

const seats = computed<Seat[]>(() => {
    const { rows } = grid.value
    if (!rows) return []

    const origin = PADDING + RADIUS

    return ordered.value.map((seat, index) => {
        const cell = cellFor(index)
        return {
            key: `${index}`,
            x: origin + cell.column * PITCH,
            y: origin + cell.row * PITCH,
            colour: seat.party === null
                ? DEFAULT_PARTY_COLOUR
                : store.partyColour(slugs.value.e, slugs.value.v, seat.party),
            filled: seat.filled,
            title: seat.party === null
                ? 'Seat not yet filled'
                : store.party(slugs.value.e, slugs.value.v, seat.party)?.name ?? 'Unknown party',
        }
    })
})

const majority = computed(() => Math.floor(props.allocation.houseSize / 2) + 1)

/**
 * The halfway mark: the middle of the block, wherever that falls.
 *
 * Snapping it to the nearest gap between columns was worse than drawing it
 * through a seat. A bloc is read as having a majority when its seats reach
 * past the line, and a line nudged half a column off centre answers that
 * question wrongly for the seat it skipped over.
 */
const majorityX = computed(() => box.value.width / 2)

// The drawing carries no caption, so this is the only place its meaning is
// stated for anyone who cannot see it.
const label = computed(() =>
    `${pluralise(props.allocation.houseSize, 'seat')}, one dot each, ordered left to right`
    + `. The dashed line is halfway: ${majority.value} seats are needed to govern.`)
</script>
