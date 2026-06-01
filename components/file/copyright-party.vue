<template>
    <div>
        <h5 v-if="copyrightParty.name" class="mb-1 text-sm">{{ copyrightParty.name }}</h5>
        <p v-if="copyrightParty.description" class="text-muted text-sm">{{ copyrightParty.description }}</p>
        <UButton v-if="copyrightParty.url" class="text-sm px-0" size="sm" :to="copyrightParty.url" target="_blank" variant="link" icon="i-lucide-link">View website</UButton>
    </div>
</template>



<script setup>

const props = defineProps({
    copyrightParty: {
        type: Object,
        required: true
    }
})
</script>