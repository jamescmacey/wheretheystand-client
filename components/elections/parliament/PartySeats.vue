<template>
    <UCard v-if="tiles.length" variant="subtle">
        <template #header>
            <div class="flex items-baseline justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Seats</h3>
                <p class="text-sm text-muted">{{ summary }}</p>
            </div>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">
            <div v-for="tile in tiles" :key="tile.key" class="flex gap-3 min-w-0">
                <ElectionsResultsPartySwatch :colour="tile.swatch" />
                <div class="min-w-0">
                    <p class="truncate text-sm" :class="tile.seated ? '' : 'text-muted'">
                        {{ tile.name }}
                    </p>
                    <p class="flex items-baseline gap-1.5 flex-wrap">
                        <span class="text-3xl font-bold tabular-nums leading-tight"
                            :class="tile.seated ? '' : 'text-muted'">{{ tile.seats }}</span>
                        <ElectionsResultsSeatChange v-if="tile.change" :note="tile.change"
                            class="text-sm text-muted" />
                    </p>
                    <p class="text-xs text-muted tabular-nums">{{ tile.split }}</p>
                    <p v-if="tile.overhang" class="text-xs text-muted">{{ tile.overhang }}</p>
                </div>
            </div>
        </div>

        <template v-if="footnote" #footer>
            <p class="text-xs text-muted">{{ footnote }}</p>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import type { SeatChangeNote } from '~/utils/elections/incumbency'
import type { SeatAllocation } from '~/utils/elections/mmp'
import { useElectionDataStore, DEFAULT_PARTY_COLOUR } from '~/stores/electionData'
import { useBlocOrder } from '~/composables/useBlocOrder'
import { useIncumbency } from '~/composables/useIncumbency'
import { formatPercent, pluralise } from '~/utils/elections/format'

/**
 * How many seats each party has, as the first thing on the page.
 *
 * A tile per party rather than a table, because the seat count is the answer
 * this page exists to give and a reader should not have to find it in a column.
 * The electorate and list split sits beneath it in a smaller size: it is the
 * part of MMP a total hides, but it is not the figure being asked for.
 *
 * No bars. Every tile would be measured against the largest party, which is a
 * comparison the chamber below already draws, and better.
 *
 * Which parties appear: those with a seat, plus those that reached half the
 * threshold. A party on 3 per cent won nothing, but "nothing" is a result, and
 * leaving it out answers the question of who nearly made it with silence.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    allocation: SeatAllocation
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))
const { order } = useBlocOrder(() => props.election, () => props.resultsVersion)
const { curated, seatChangeNoteFor } = useIncumbency(
    () => props.election, () => props.resultsVersion)

interface Tile {
    key: EntityNumber
    name: string
    swatch: string
    seats: number
    seated: boolean
    split: string
    overhang: string | null
    change: SeatChangeNote | null
}

/** Half the threshold, as a percentage, to match the shares on qualification. */
const halfThreshold = computed(() => (props.allocation.settings.threshold * 100) / 2)

/**
 * Parties in Parliament, plus the ones that came within half the threshold.
 *
 * Ordered by bloc so the tiles read in the same order as the seats below them,
 * and by size where no blocs have been curated.
 */
const shown = computed(() => {
    const entries = new Map<EntityNumber, number>()

    for (const [party, seats] of props.allocation.totalSeats) {
        if (seats > 0) entries.set(party, seats)
    }

    for (const party of props.allocation.qualification) {
        if (party.votes <= 0 || party.share < halfThreshold.value) continue
        if (!entries.has(party.party)) entries.set(party.party, 0)
    }

    return order([...entries.entries()])
})

const tiles = computed<Tile[]>(() => shown.value.map(([party, seats]) => {
    const overhang = props.allocation.overhangByParty.get(party) ?? 0
    const share = props.allocation.qualification
        .find(entry => entry.party === party)?.share ?? null

    return {
        key: party,
        name: store.party(slugs.value.e, slugs.value.v, party)?.name ?? 'Unknown party',
        // A party with no seats is drawn grey: every tile beside it is a party
        // that is in Parliament, and its own colour would say otherwise.
        swatch: seats > 0
            ? store.partyColour(slugs.value.e, slugs.value.v, party)
            : DEFAULT_PARTY_COLOUR,
        seats,
        seated: seats > 0,
        // Where there are no seats to split, the party vote is the only figure
        // that explains why the party is on the page at all.
        split: seats > 0
            ? `${props.allocation.electorateSeats.get(party) ?? 0} electorate`
            + ` · ${props.allocation.listSeats.get(party) ?? 0} list`
            : `${formatPercent(share) ?? '—'} of the party vote`,
        overhang: overhang > 0
            ? `Overhang of ${pluralise(overhang, 'seat')}`
            : null,
        change: seatChangeNoteFor(party, seats),
    }
}))

const summary = computed(() => {
    const parts = [pluralise(props.allocation.houseSize, 'seat')]
    if (props.allocation.overhang > 0) {
        parts.push(`including an overhang of ${pluralise(props.allocation.overhang, 'seat')}`)
    }
    return parts.join(', ')
})

/**
 * The two things the figures above do not say for themselves.
 *
 * The change beside each total is a bare figure, so what it is measured
 * against has to be stated somewhere a reader will find it. And the seats a
 * majority takes is the number every total on the card is really being read
 * against, which nothing else on the page states now the chamber carries no
 * caption.
 */
const footnote = computed(() => {
    const majority = Math.floor(props.allocation.houseSize / 2) + 1
    const parts = [`${pluralise(majority, 'seat')} for a majority.`]
    if (curated.value) {
        parts.unshift('Change is against the seats held going into the election.')
    }
    return parts.join(' ')
})
</script>
