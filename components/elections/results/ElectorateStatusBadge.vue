<template>
    <UBadge :color="badge.color" variant="subtle" size="sm">{{ badge.label }}</UBadge>
</template>

<script setup lang="ts">
import type { ElectorateResultStatus } from '~/types/elections'

/**
 * How far along an electorate's count is, in one word.
 *
 * "Leading" rather than "Won" or "Elected", even once a results set is marked
 * final: that marks the end of updates to the set, which for preliminary
 * results is not the declaration of the seat.
 * Where the count has not reached an electorate at all the badge says so
 * plainly -- the alternative, before the store told the two apart, was every
 * electorate reading "too close to call" the moment polls closed.
 */
const props = defineProps<{
    status?: ElectorateResultStatus | null
}>()

const badge = computed(() => {
    switch (props.status) {
        case 'determined':
            return { label: 'Leading', color: 'primary' as const }
        case 'indeterminate':
            return { label: 'Too close', color: 'warning' as const }
        case 'defaulted':
            return { label: 'Unopposed', color: 'neutral' as const }
        case 'no_candidates':
            return { label: 'No candidates', color: 'neutral' as const }
        case 'uncounted':
        default:
            return { label: 'Not counted', color: 'neutral' as const }
    }
})
</script>
