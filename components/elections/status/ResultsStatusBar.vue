<template>
    <div v-if="source" class="flex flex-wrap items-center gap-2">
        <ElectionsResultsStatusIndicator :mode="source.mode.value" :connection="source.connection.value"
            :last-updated="source.lastUpdated.value" :is-final="source.isFinal.value"
            :live-ended="source.liveEnded.value" />
        <ElectionsResultsCountedProgress :percent="source.percentCounted.value"
            :counted="source.votingPlacesCounted.value" :total="source.votingPlacesTotal.value" />
        <slot />
    </div>
</template>

<script setup lang="ts">
import { useInjectedElectionSource } from '~/composables/useElectionSource'

// Every view is now served by one transport or the other -- live from Firestore
// or archived from the snapshots -- so there is no "delayed" state to declare.
const source = useInjectedElectionSource()
</script>
