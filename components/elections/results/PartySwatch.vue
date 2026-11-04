<template>
    <div class="flex-shrink-0 w-2 self-stretch rounded-md"
        :style="{ background: partyFill(colour ?? DEFAULT_PARTY_COLOUR, alternate, 'horizontal') }"
        aria-hidden="true" />
</template>

<script setup lang="ts">
import { DEFAULT_PARTY_COLOUR } from '~/stores/electionData'
import { partyFill } from '~/utils/elections/partyFill'

// Decorative: the party is always named in text beside it, so this carries no
// information of its own.
defineProps<{ colour?: string | null, alternate?: string | null }>()
</script>
