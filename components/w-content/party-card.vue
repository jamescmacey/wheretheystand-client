<template>
    <WContentItemCard :item="{ colour: party.colour }"
        :to="'/parties/' + party.slug">
        <template #title>
                <div class="min-w-0">
                    <p class="font-medium text-highlighted truncate">{{ party.display_name }}</p>
                </div>
        </template>
    </WContentItemCard>

</template>

<script setup>

defineProps({
    party: {
        type: Object,
        required: true,
    }
})

</script>