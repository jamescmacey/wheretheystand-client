<template>
    <UCard v-if="allocation && segments.length" variant="soft">
        <template #header>
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">Seats</h3>
                <UButton :to="parliamentHref" variant="link" color="neutral" size="sm"
                    trailing-icon="i-lucide-arrow-right">
                    Parliament
                </UButton>
            </div>
        </template>

        <ElectionsResultsSeatBar :seats="segments" :nominal-total="allocation.settings.baseSeats" />

        <!-- The split between electorate and list seats is the whole point of
             MMP and is invisible in the bar above, which shows only totals. -->
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div v-for="segment in segments" :key="segment.key" class="min-w-0">
                <div class="flex items-center gap-2 min-w-0">
                    <ElectionsResultsPartySwatch :colour="segment.colour" />
                    <p class="truncate text-sm">{{ segment.label }}</p>
                </div>
                <p class="font-bold tabular-nums">
                    {{ segment.seats }}
                    <ElectionsResultsSeatChange v-if="segment.change" :note="segment.change"
                        class="ml-1 align-middle text-xs font-normal text-muted" />
                </p>
                <p class="text-xs text-muted tabular-nums">{{ segment.split }}</p>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import type { SeatSegment } from './SeatBar.vue'
import type { SeatChangeNote } from '~/utils/elections/incumbency'
import { useElectionDataStore } from '~/stores/electionData'
import { useSeatAllocation } from '~/composables/useSeatAllocation'
import { useBlocOrder } from '~/composables/useBlocOrder'
import { useIncumbency } from '~/composables/useIncumbency'

/**
 * Where the seats fell, at a glance.
 *
 * Reads the same allocation the Parliament page does, so the two can never disagree
 * about how many seats a party has -- which they would if this took the feed's
 * own figures while Parliament worked its own out.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const { allocation } = useSeatAllocation(() => props.election, () => props.resultsVersion)
const { order } = useBlocOrder(() => props.election, () => props.resultsVersion)
const { seatChangeNoteFor, withDefendingParties } = useIncumbency(
    () => props.election, () => props.resultsVersion)

const parliamentHref = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}/parliament`)

type Segment = SeatSegment & { split: string, change: SeatChangeNote | null }

const segments = computed<Segment[]>(() => {
    if (!allocation.value) return []
    const slugs = { e: props.election.slug, v: props.resultsVersion.slug }

    // Parties that held seats and won none are carried here with a count of
    // zero, so that losing every seat is stated rather than left to the
    // reader's memory. The bar drops them of its own accord.
    const entries = withDefendingParties([...allocation.value.totalSeats.entries()]
        .filter(([, seats]) => seats > 0))

    // Ordered by bloc, so the bar reads left to right the way the chamber on
    // the Parliament page does. Falls back to size where none is curated.
    return order(entries)
        .map(([party, seats]) => ({
            key: party,
            label: store.party(slugs.e, slugs.v, party)?.name ?? 'Unknown party',
            seats,
            colour: store.partyColour(slugs.e, slugs.v, party),
            split: `${allocation.value!.electorateSeats.get(party) ?? 0} electorate`
                + ` · ${allocation.value!.listSeats.get(party) ?? 0} list`,
            change: seatChangeNoteFor(party, seats),
        }))
})
</script>
