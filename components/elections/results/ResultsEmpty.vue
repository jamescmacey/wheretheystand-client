<template>
    <UCard variant="subtle">
        <UEmpty :title="title" :description="description" icon="i-lucide-inbox" />
    </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    title?: string
    description?: string
}>(), {
    title: 'No results yet',
    description: 'Results for this view have not been reported yet.',
})
</script>
