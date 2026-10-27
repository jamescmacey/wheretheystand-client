<template>
    <div v-if="totalSeats > 0">
        <div class="relative flex h-8 w-full overflow-hidden rounded-md bg-accented">
            <div v-for="segment in segments" :key="segment.key" class="h-full transition-[width] duration-300"
                :style="{ width: `${segment.share}%`, backgroundColor: segment.colour }"
                :title="`${segment.label}: ${segment.seats} seats`" />
            <!-- Where a majority begins, so a reader can see who is past it. -->
            <div class="absolute inset-y-0 border-l-2 border-inverted/70"
                :style="{ left: `${majorityPosition}%` }" aria-hidden="true" />
        </div>
        <p class="mt-2 text-sm text-muted">
            {{ majority }} seats to govern · {{ totalSeats }} seats in total
            <span v-if="overhang > 0">· includes an overhang of {{ overhang }} seat<span
                v-if="overhang > 1">s</span></span>
        </p>
    </div>
</template>

<script setup lang="ts">
import { DEFAULT_PARTY_COLOUR } from '~/stores/electionData'

export interface SeatSegment {
    key: string | number
    label: string
    seats: number
    colour?: string | null
}

const props = withDefaults(defineProps<{
    seats: SeatSegment[]
    /** Seats in a Parliament without an overhang. */
    nominalTotal?: number
}>(), { nominalTotal: 120 })

const held = computed(() => props.seats.filter(segment => segment.seats > 0))
const totalSeats = computed(() => held.value.reduce((sum, s) => sum + s.seats, 0))
const majority = computed(() => Math.floor(totalSeats.value / 2) + 1)
const overhang = computed(() => Math.max(0, totalSeats.value - props.nominalTotal))
const majorityPosition = computed(() =>
    totalSeats.value === 0 ? 50 : (majority.value / totalSeats.value) * 100)

const segments = computed(() => held.value.map(segment => ({
    ...segment,
    colour: segment.colour ?? DEFAULT_PARTY_COLOUR,
    share: totalSeats.value === 0 ? 0 : (segment.seats / totalSeats.value) * 100,
})))
</script>
