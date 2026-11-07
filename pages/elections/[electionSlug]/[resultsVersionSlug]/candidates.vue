<template>
    <ElectionsLayoutDashboardPage :status="false">
        <template #heading>
            <h2 class="text-2xl font-bold">
                {{ candidates.length ? `${candidates.length} candidates` : 'Candidates' }}
            </h2>
            <p v-if="candidates.length" class="text-muted">
                A list of all candidates standing in this election is below. For results, visit the
                candidate's electorate<template v-if="hasPartyVote"> or see the
                <ULink :to="`/elections/${election.slug}/${resultsVersion.slug}/parliament`"
                    class="underline">Parliament page</ULink></template>.
            </p>
        </template>

        <div v-if="candidates.length" class="flex flex-col gap-6">
            <section v-for="section in sections" :key="section.title" class="flex flex-col gap-2">
                <h3 v-if="showHeadings" class="text-lg font-semibold">{{ section.title }}</h3>
                <ElectionsCandidatesPartyGroup v-for="group in section.groups" :key="group.party ?? 'independent'"
                    :election="election" :resultsVersion="resultsVersion" :group="group" />
            </section>
        </div>
        <p v-else-if="waiting" class="text-muted">Loading candidates…</p>
        <ElectionsResultsEmpty v-else title="No candidates yet"
            description="The candidates for this election have not been published yet." />
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { ELECTION_SOURCE_KEY } from '~/composables/useElectionSource'
import { useElectionShape } from '~/composables/useElectionShape'
import { useElectionDataStore } from '~/stores/electionData'
import { groupCandidatesByParty, sectionCandidateGroups } from '~/utils/elections/candidates'

/**
 * Who is standing, from reference data alone.
 *
 * Claims no results scope and reads no tallies, which is what lets it through
 * the gate in the parent page: it is most useful before polls close, when there
 * is nothing else to look at.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const store = useElectionDataStore()
const source = inject(ELECTION_SOURCE_KEY, null)
// A by-election has no Parliament page to send anyone to.
const { hasPartyVote } = useElectionShape()

const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const candidates = computed(() =>
    store.referenceData(slugs.value.e, slugs.value.v)?.candidates ?? [])

const groups = computed(() => groupCandidatesByParty(
    candidates.value,
    (party) => {
        const persistent = store.persistentPartyForParty(slugs.value.e, slugs.value.v, party)
        return persistent?.display_name || store.party(slugs.value.e, slugs.value.v, party)?.name || ''
    },
    electorate => store.electorate(slugs.value.e, slugs.value.v, electorate)?.name ?? '',
))

const divided = computed(() => sectionCandidateGroups(groups.value))

const sections = computed(() => [
    { title: 'Parties contesting the party vote', groups: divided.value.partyVote },
    { title: 'Parties running only in electorates', groups: divided.value.electoratesOnly },
    { title: 'Independent candidates', groups: divided.value.independent ? [divided.value.independent] : [] },
].filter(section => section.groups.length))

// A by-election has no party vote, so nothing there is "only" in electorates.
const showHeadings = computed(() => divided.value.partyVote.length > 0)

// Named by the manifest and nothing has failed, so it is on its way. Anything
// else is not going to arrive, and saying so beats a line that never changes.
const waiting = computed(() => {
    const provenance = source?.provenance.value
    return Boolean(props.resultsVersion.paths.reference
        && !provenance?.reference.error
        && !provenance?.persistent.error)
})
</script>
