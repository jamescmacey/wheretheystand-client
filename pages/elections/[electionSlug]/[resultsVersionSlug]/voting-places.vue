<template>
    <ElectionsLayoutDashboardPage title="Voting places" heading="Voting places">
        <ElectionsResultsEmpty title="Voting places are not available yet"
            description="Results for individual voting places have not been published for this results version." />
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'

defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()
</script>
