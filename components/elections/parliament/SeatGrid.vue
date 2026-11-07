<template>
    <div v-if="seats.length">
        <!-- Capped at the viewBox's own width, so a dot never draws larger
             than it was designed at. Without it a wide panel scales the whole
             block up and the seats become saucers. -->
        <svg :viewBox="`0 0 ${box.width} ${box.height}`" class="w-full h-auto mx-auto" role="img"
            :style="{ maxWidth: `${box.width}px` }" :aria-label="label">
            <!-- A party with two colours is split along the diagonal from the
                 bottom left to the top right, its primary colour above. The
                 gradient is in each circle's own box, which is square, so the
                 hard stop halfway along it is that diagonal. -->
            <defs v-if="gradients.length">
                <linearGradient v-for="gradient in gradients" :id="gradient.id" :key="gradient.id"
                    x1="0" y1="0" x2="1" y2="1">
                    <stop offset="50%" :stop-color="gradient.colour" />
                    <stop offset="50%" :stop-color="gradient.alternate" />
                </linearGradient>
            </defs>
            <circle v-for="seat in seats" :key="seat.key" :cx="seat.x" :cy="seat.y" :r="RADIUS"
                :fill="seat.fill" :stroke="seat.filled ? 'none' : 'currentColor'"
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
import { seatGridCell, seatGridShape } from '~/utils/elections/seatGrid'

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
 * Independents have no bloc to sit with, so they sit in the middle with the
 * cross-bench, in the grey every independent is drawn in elsewhere.
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

// Gradient ids are document-wide, and the page can hold more than one grid.
const gradientPrefix = `seat-split-${useId()}`

const gradientId = (colour: string, alternate: string) =>
    `${gradientPrefix}-${`${colour}-${alternate}`.replace(/[^a-z0-9]/gi, '')}`

const RADIUS = 9
const PITCH = 24
const PADDING = 6

interface Seat {
    key: string
    x: number
    y: number
    colour: string
    alternate: string | null
    /** What the circle is filled with: the colour, or a gradient naming both. */
    fill: string
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

    // Seats in no party's total: independents, then seats that exist but have
    // nobody in them. Spliced in where the right bloc begins, so they land in the
    // middle rather than padding an edge; with no blocs curated that index is
    // the end, as it always was.
    // A vacant seat from an underhang is not drawn: it is not part of the House
    // until the next election, which is why the House is smaller.
    const unaligned = [
        ...Array.from({ length: props.allocation.independentSeats },
            () => ({ party: null as EntityNumber | null, filled: true })),
        ...Array.from({ length: props.allocation.undecidedSeats },
            () => ({ party: null as EntityNumber | null, filled: false })),
    ]
    if (!unaligned.length) return list

    const seatsBefore = entries
        .slice(0, unalignedIndex(entries))
        .reduce((sum, [, seats]) => sum + seats, 0)
    list.splice(seatsBefore, 0, ...unaligned)
    return list
})

const grid = computed(() => seatGridShape(ordered.value.length))

const box = computed(() => {
    const { rows, columns } = grid.value
    const span = (count: number) =>
        PADDING * 2 + RADIUS * 2 + Math.max(0, count - 1) * PITCH
    return { width: span(columns), height: span(rows) }
})

const seats = computed<Seat[]>(() => {
    if (!grid.value.rows) return []

    const origin = PADDING + RADIUS

    return ordered.value.map((seat, index) => {
        const cell = seatGridCell(index, grid.value)
        const colour = seat.party === null
            ? DEFAULT_PARTY_COLOUR
            : store.partyColour(slugs.value.e, slugs.value.v, seat.party)
        const alternate = seat.party === null
            ? null
            : store.partyAlternateColour(slugs.value.e, slugs.value.v, seat.party)
        return {
            key: `${index}`,
            x: origin + cell.column * PITCH,
            y: origin + cell.row * PITCH,
            colour,
            alternate,
            fill: alternate ? `url(#${gradientId(colour, alternate)})` : colour,
            filled: seat.filled,
            title: seat.party === null
                ? (seat.filled ? 'Independent' : 'Seat not yet filled')
                : store.party(slugs.value.e, slugs.value.v, seat.party)?.name ?? 'Unknown party',
        }
    })
})

/** One gradient per two-coloured party on the grid. */
const gradients = computed(() => {
    const unique = new Map<string, { id: string, colour: string, alternate: string }>()
    for (const seat of seats.value) {
        if (!seat.alternate) continue
        const id = gradientId(seat.colour, seat.alternate)
        unique.set(id, { id, colour: seat.colour, alternate: seat.alternate })
    }
    return [...unique.values()]
})

const majority = computed(() => Math.floor(props.allocation.houseSize / 2) + 1)

/**
 * The halfway mark: the middle of the block, which `seatGridCell` keeps as the
 * middle of the seats too.
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
