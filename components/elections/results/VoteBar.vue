<template>
    <UProgress :model-value="clamped" :max="max" size="xl" :style="colour ? { '--vote-bar': colour } : undefined" :ui="{
        base: 'relative overflow-hidden rounded-sm bg-accented',
        indicator: 'rounded-sm size-full transition-transform duration-200 ease-out'
            + (colour ? ' bg-[var(--vote-bar)]' : ''),
    }" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    value?: number | null
    max?: number
    colour?: string | null
}>(), { value: null, max: 100, colour: null })

// A share can exceed the nominal maximum while a count is partial, and a bar
// running past its track reads as a rendering fault rather than a large share.
const clamped = computed(() => {
    if (props.value === null || !Number.isFinite(props.value)) return 0
    return Math.max(0, Math.min(props.value, props.max))
})
</script>
