<template>
    <div>
        <h5 v-if="licence.name" class="mb-1 text-sm">{{ licence.name }}</h5>
        <p v-if="licence.description" class="text-muted text-sm">{{ licence.description }}</p>
        <UButton v-if="licence.licence_url" class="text-sm px-0" size="sm" :to="licence.licence_url" target="_blank" variant="link" icon="i-lucide-link">View licence</UButton>
    </div>
</template>



<script setup>

const props = defineProps({
    licence: {
        type: Object,
        required: true
    }
})
</script>