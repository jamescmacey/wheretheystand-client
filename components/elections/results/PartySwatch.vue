<template>
    <div class="flex-shrink-0 w-2 self-stretch rounded-md" :style="{ backgroundColor: colour ?? DEFAULT_PARTY_COLOUR }"
        aria-hidden="true" />
</template>

<script setup lang="ts">
import { DEFAULT_PARTY_COLOUR } from '~/stores/electionData'

// Decorative: the party is always named in text beside it, so this carries no
// information of its own.
defineProps<{ colour?: string | null }>()
</script>
