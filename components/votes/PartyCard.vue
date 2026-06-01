<template>
    <WContentItemCard :item="{ colour: party.colour }"
        :to="'/parties/' + party.slug">
                <div class="w-full flex flex-row flex-col justify-between items-center">
                    <span class="font-medium text-highlighted truncate flex-shrink min-w-0">{{ party.display_name }}</span>
                    <div class="text-center">
                        <h4 class="text-2xl font-semibold ml-auto">{{ contribution }}</h4>
                        <h5 class="text-sm text-muted">vote{{ contribution === 1 ? '' : 's' }}</h5>
                    </div>
                    
                </div>
    </WContentItemCard>

</template>

<script setup>

defineProps({
    party: {
        type: Object,
        required: true,
    },
    contribution: {
        type: Number,
        required: true,
    }
})

</script>