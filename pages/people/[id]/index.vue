<template>
    {{ person }}
</template>

<script setup>

// have a prop called person
const props = defineProps({
    person: {
        type: Object,
        required: true
    }
})


</script>