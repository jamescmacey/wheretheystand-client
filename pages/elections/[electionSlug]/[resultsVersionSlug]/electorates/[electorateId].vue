<template>
    <ElectionsLayoutDashboardPage :breadcrumb="breadcrumbItems" :heading="electorate?.name">
            <template v-if="electorate">
                <ElectionsResultsElectorateResults v-if="electorate.accepting_candidate_votes" :election="election"
                    :resultsVersion="resultsVersion" :electorate="electorateNumber" category="candidate_votes" />
                <UAlert v-else color="warning" variant="subtle" icon="i-lucide-info"
                    title="No candidate election"
                    description="The candidate election in this electorate was cancelled, so only party votes were counted." />

                <ElectionsResultsElectorateResults v-if="hasPartyVote" :election="election"
                    :resultsVersion="resultsVersion" :electorate="electorateNumber" category="party_votes" />
            </template>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useResultsScope } from '~/composables/useElectionSource'
import { useElectionShape } from '~/composables/useElectionShape'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const route = useRoute()
const store = useElectionDataStore()

// A by-election has no party vote, so the party-vote card below would render an
// empty state permanently rather than one waiting to be filled.
const { hasPartyVote } = useElectionShape()

// Electorates are addressed by their Electoral Commission number, which is what
// the results reference.
const electorateNumber = computed(() => Number(route.params.electorateId))

const electorate = computed(() =>
    store.electorate(props.election.slug, props.resultsVersion.slug, electorateNumber.value))

const referenceLoaded = computed(() =>
    (store.referenceData(props.election.slug, props.resultsVersion.slug)?.electorates.length ?? 0) > 0)

// Only a genuine 404 once there is a list of electorates to be absent from.
// Reference data can arrive after first render during a live event.
watch([electorate, referenceLoaded], ([found, loaded]) => {
    if (loaded && !found) {
        throw createError({ statusCode: 404, statusMessage: 'Electorate not found' })
    }
}, { immediate: true })

// Narrow the live subscription to this electorate: two documents rather than
// every electorate's, and released when the page closes.
useResultsScope(() => ({ kind: 'electorate', electorate: electorateNumber.value }))

const breadcrumbItems = computed(() => [
    {
        label: 'Electorates',
        to: `/elections/${props.election.slug}/${props.resultsVersion.slug}/electorates`,
        icon: 'i-lucide-map',
    },
    { label: electorate.value?.name ?? '' },
])
</script>
