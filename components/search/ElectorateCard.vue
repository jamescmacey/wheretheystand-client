<template>
    <UPageCard variant="outline" :item="electorate"
        :to="'/electorates/' + electorate.slug">
        <template #title>
            {{ electorate.name }}
        </template>
        <template #description>
            {{ electorate.electorate_type === 'general' ? 'General electorate' : 'Māori electorate' }}
        </template>
    </UPageCard>
</template>

<script setup>

defineProps({
    electorate: {
        type: Object,
        required: true,
    }
})

</script>