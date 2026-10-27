<template>
    <ElectionsLayoutDashboardPage :breadcrumb="breadcrumbItems">
            <!-- The candidate is named before the provenance of their figures.
                 In the default slot the status bar would sit above the name. -->
            <template #heading>
                <div v-if="candidate" class="flex items-center gap-3">
                    <ElectionsResultsPartySwatch :colour="persistentParty?.colour" />
                    <div>
                        <h2 class="text-2xl font-bold">{{ candidate.name }}</h2>
                        <p class="text-muted">
                            {{ party?.name ?? 'Independent' }}
                            <span v-if="electorate"> · {{ electorate.name }}</span>
                            <span v-if="candidate.list_pos"> · {{ candidate.list_pos }} on list</span>
                        </p>
                    </div>
                </div>
            </template>

            <template v-if="candidate">
                <UButton v-if="person" :to="`/people/${person}`" variant="subtle" color="neutral"
                    icon="i-lucide-user" trailing class="self-start">
                    View profile
                </UButton>

                <ElectionsResultsElectorateResults v-if="candidate.electorate !== null" :election="election"
                    :resultsVersion="resultsVersion" :electorate="candidate.electorate" category="candidate_votes" />
                <ElectionsResultsEmpty v-else title="List candidate"
                    description="This candidate stood on a party list only, so no electorate result applies." />
            </template>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useResultsScope } from '~/composables/useElectionSource'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const route = useRoute()
const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const candidateNumber = computed(() => Number(route.params.candidateId))

const candidate = computed(() =>
    store.candidate(slugs.value.e, slugs.value.v, candidateNumber.value))

const referenceLoaded = computed(() =>
    (store.referenceData(slugs.value.e, slugs.value.v)?.candidates.length ?? 0) > 0)

// Only a genuine 404 once there is a list of candidates to be absent from.
watch([candidate, referenceLoaded], ([found, loaded]) => {
    if (loaded && !found) {
        throw createError({ statusCode: 404, statusMessage: 'Candidate not found' })
    }
}, { immediate: true })

const party = computed(() => (candidate.value?.party
    ? store.party(slugs.value.e, slugs.value.v, candidate.value.party)
    : null))

const electorate = computed(() => (candidate.value?.electorate
    ? store.electorate(slugs.value.e, slugs.value.v, candidate.value.electorate)
    : null))

// This candidate's own electorate, once reference data says which one it is:
// two documents rather than every electorate's.
useResultsScope(() => (candidate.value?.electorate
    ? { kind: 'electorate', electorate: candidate.value.electorate }
    : null))

const persistentParty = computed(() =>
    store.persistentPartyForCandidate(slugs.value.e, slugs.value.v, candidateNumber.value))

const person = computed(() =>
    store.persistentCandidateFor(slugs.value.e, slugs.value.v, candidateNumber.value)?.person ?? null)

const breadcrumbItems = computed(() => [
    {
        label: 'Candidates',
        to: `/elections/${props.election.slug}/${props.resultsVersion.slug}/candidates`,
        icon: 'i-lucide-users',
    },
    { label: candidate.value?.name ?? '' },
])
</script>
