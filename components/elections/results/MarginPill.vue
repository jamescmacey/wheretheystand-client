<template>
    <span v-if="text" class="text-sm text-muted">{{ text }}</span>
</template>

<script setup lang="ts">
import type { ComputedElectorateResult } from '~/types/elections'
import { formatCount, formatPoints } from '~/utils/elections/format'

/**
 * How far ahead the leader is.
 *
 * A tie is stated as a tie rather than as a margin of nothing: "0 votes" reads
 * like a near miss, when what it means is that the seat is undecided and will
 * be settled by lot or by the specials.
 */
const props = defineProps<{
    result?: ComputedElectorateResult | null
}>()

const text = computed(() => {
    const result = props.result
    if (!result) return null
    if (result.resultStatus === 'indeterminate') return 'The leading candidates are tied.'
    if (result.margin === null) return null

    const votes = formatCount(result.margin)
    const points = formatPoints(result.marginPercentage)
    return points ? `Margin of ${votes} votes (${points}).` : `Margin of ${votes} votes.`
})
</script>
