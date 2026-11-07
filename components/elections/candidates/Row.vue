<template>
    <div class="grid grid-cols-1 @md:grid-cols-2 @md:items-center gap-x-4 gap-y-1 min-w-0">
        <div class="flex items-baseline gap-2 min-w-0">
            <ElectionsEntityCandidateLabel :link="false" :election="election" :resultsVersion="resultsVersion"
                :candidate="candidate.number" :swatch="false" :showParty="false" />
            <span v-if="candidate.is_dead" class="shrink-0 text-xs text-muted">Deceased</span>
        </div>
        <ElectionsEntityElectorateBadge v-if="candidate.electorate" class="justify-self-start max-w-full"
            :election="election" :resultsVersion="resultsVersion" :electorate="candidate.electorate" />
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary, ReferenceCandidate, ResultsVersion } from '~/types/elections'

/**
 * A candidate and the electorate they stand in, if any.
 */
defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    candidate: ReferenceCandidate
}>()
</script>
