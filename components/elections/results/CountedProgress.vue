<template>
    <UBadge v-if="percent !== null" icon="i-lucide-clipboard-check" variant="outline" color="neutral" size="md">
        {{ formatted }}
    </UBadge>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    percent?: number | null
    counted?: number | null
    total?: number | null
    /** What is being counted, for the parenthetical. */
    noun?: string
}>(), { percent: null, counted: null, total: null, noun: 'voting places' })

import { formatCount } from '~/utils/elections/format'

const formatted = computed(() => {
    const share = `${(props.percent ?? 0).toFixed(1)} per cent counted`
    if (props.counted === null || props.total === null || props.total === 0) return share
    return `${share} (${formatCount(props.counted)} of ${formatCount(props.total)} ${props.noun})`
})
</script>
