<template>
    <UProgress :model-value="clamped" :max="max" size="xl"
        :style="colour ? { '--vote-bar': partyFill(colour, alternate, 'horizontal') } : undefined" :ui="{
        base: 'relative overflow-hidden rounded-sm bg-accented',
        indicator: 'rounded-sm size-full transition-transform duration-200 ease-out'
            + (colour ? ' [background:var(--vote-bar)]' : ''),
    }" />
</template>

<script setup lang="ts">
import { partyFill } from '~/utils/elections/partyFill'

const props = withDefaults(defineProps<{
    value?: number | null
    max?: number
    colour?: string | null
    alternate?: string | null
}>(), { value: null, max: 100, colour: null, alternate: null })

// A share can exceed the nominal maximum while a count is partial, and a bar
// running past its track reads as a rendering fault rather than a large share.
const clamped = computed(() => {
    if (props.value === null || !Number.isFinite(props.value)) return 0
    return Math.max(0, Math.min(props.value, props.max))
})
</script>
