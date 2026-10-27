<template>
    <UCard variant="soft">
        <template #header>
            <h3 class="font-bold">{{ heading }}</h3>
        </template>

        <ElectionsResultsEmpty v-if="!results" :title="`No ${noun} yet`"
            :description="`${headingNoun} for this electorate have not been reported yet.`" />
        <ElectionsResultsTable v-else :columns="columns" :rows="rows" :totals="totals" :bar-max="barMax"
            lead-width="minmax(9rem, 18rem)" />
    </UCard>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ResultsCategory, ResultsVersion,
} from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { formatCount, formatPercent } from '~/utils/elections/format'

/**
 * Candidate or party results within one electorate.
 *
 * Replaces two near-identical components that differed only in which entity
 * labelled the row.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
    category: ResultsCategory
}>()

const store = useElectionDataStore()

const isCandidates = computed(() => props.category === 'candidate_votes')
const noun = computed(() => (isCandidates.value ? 'candidate votes' : 'party votes'))
const headingNoun = computed(() => (isCandidates.value ? 'Candidate votes' : 'Party votes'))
const heading = computed(() => headingNoun.value)

const results = computed(() => store.electorateResults(
    props.election.slug, props.resultsVersion.slug, props.electorate, props.category))

const columns: ResultsColumn[] = [
    { key: 'count', label: 'Votes', width: '6rem' },
    { key: 'share', label: 'Share', width: '5rem' },
]

const totalVotes = computed(() =>
    results.value?.statistics.total_votes_cast
    ?? (results.value?.results ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0))

const share = (count: number | null) =>
    (!count || !totalVotes.value ? 0 : (count / totalVotes.value) * 100)

// Copied before sorting: this array belongs to the store.
const ordered = computed(() =>
    [...(results.value?.results ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)))

const barMax = computed(() =>
    Math.max(10, ...ordered.value.map(result => share(result.count))))

const rows = computed<ResultsRow[]>(() => {
    const slugs = { election: props.election.slug, version: props.resultsVersion.slug }

    const contested: ResultsRow[] = ordered.value.map(result => {
        if (isCandidates.value) {
            const candidate = result.candidate === null
                ? null
                : store.candidate(slugs.election, slugs.version, result.candidate)
            const party = result.candidate === null
                ? null
                : store.persistentPartyForCandidate(slugs.election, slugs.version, result.candidate)
            const electionParty = candidate?.party === null || candidate?.party === undefined
                ? null
                : store.party(slugs.election, slugs.version, candidate.party)
            return {
                key: result.candidate ?? `unknown-${result.count}`,
                label: candidate?.name ?? 'Unknown candidate',
                sublabel: electionParty?.name ?? 'Independent',
                colour: party?.colour ?? null,
                cells: {
                    count: formatCount(result.count),
                    share: formatPercent(share(result.count)),
                },
                bar: share(result.count),
            }
        }

        const party = result.party === null
            ? null
            : store.party(slugs.election, slugs.version, result.party)
        return {
            key: result.party ?? `unknown-${result.count}`,
            label: party?.name ?? 'Unknown party',
            colour: store.partyColour(slugs.election, slugs.version, result.party),
            cells: {
                count: formatCount(result.count),
                share: formatPercent(share(result.count)),
            },
            bar: share(result.count),
        }
    })

    const informals = results.value?.informals ?? null
    if (informals !== null) {
        contested.push({
            key: 'informals',
            label: 'Informal votes',
            muted: true,
            bar: share(informals),
            cells: {
                count: formatCount(informals),
                share: formatPercent(share(informals)),
            },
        })
    }

    return contested
})

const totals = computed(() => ({
    label: 'Total votes cast',
    note: null,
    cells: { count: formatCount(totalVotes.value), share: null },
}))
</script>
