<template>
<WContentPartyCard variant="outline" :party="party" />
</template>

<script setup>

defineProps({
    party: {
        type: Object,
        required: true,
    }
})

</script>