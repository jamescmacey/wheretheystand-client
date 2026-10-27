<template>
    <UBadge :color="badge.color" variant="subtle" size="sm">{{ badge.label }}</UBadge>
</template>

<script setup lang="ts">
import type { ElectorateResultStatus } from '~/types/elections'

/**
 * How far along an electorate's count is, in one word.
 *
 * "Leading" rather than "Won", because until the count is final it is not.
 * Where the count has not reached an electorate at all the badge says so
 * plainly -- the alternative, before the store told the two apart, was every
 * electorate reading "too close to call" the moment polls closed.
 */
const props = defineProps<{
    status?: ElectorateResultStatus | null
    /** Once the whole count is final, leading becomes elected. */
    isFinal?: boolean
}>()

const badge = computed(() => {
    switch (props.status) {
        case 'determined':
            return {
                label: props.isFinal ? 'Elected' : 'Leading',
                color: 'primary' as const,
            }
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
