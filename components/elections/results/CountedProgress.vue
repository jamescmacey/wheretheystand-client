<template>
    <div v-if="percent !== null" class="flex flex-col gap-1 min-w-72" :title="detail ?? undefined">
        <span class="text-xs text-muted">Counting progress</span>
        <div class="flex items-center gap-2">
            <UProgress :model-value="clamped" :max="100" size="md" class="flex-1" />
            <span class="text-sm font-medium tabular-nums whitespace-nowrap">{{ formatPercent(percent) }} of {{ noun }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    percent?: number | null
    counted?: number | null
    total?: number | null
    /** What is being counted, for the label and the tooltip. */
    noun?: string
}>(), { percent: null, counted: null, total: null, noun: 'voting places' })

import { formatCount, formatPercent } from '~/utils/elections/format'

const clamped = computed(() => Math.min(100, Math.max(0, props.percent ?? 0)))

const detail = computed(() => {
    if (props.counted === null || props.total === null || props.total === 0) return null
    return `${formatCount(props.counted)} of ${formatCount(props.total)} ${props.noun} counted`
})
</script>
