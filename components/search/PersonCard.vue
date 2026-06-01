<template>
    <WContentPersonCard variant="outline" :person="person" />
</template>

<script setup>

defineProps({
    person: {
        type: Object,
        required: true,
    }
})

</script>