<template>
    <ElectionsLayoutDashboardPage title="Candidates" :heading="`${candidates.length} candidates`">
                <WContentPaginatedItems :items="candidates" :item-key="item => item.number" item-label="candidates"
                    :items-per-page="25" url-prefix="candidates" :query-params="defaultQueryParams" :sync-url="true"
                    :custom-filter="customFilter" :custom-sort="customSort">
                    <template #filters="{ filters, updateFilter }">
                        <UCard variant="subtle" class="mb-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <UFormField label="Search by name" name="search">
                                    <UInput :model-value="filters.search || ''" placeholder="Search candidates…"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('search', value)" />
                                </UFormField>
                                <UFormField label="Sort by" name="ordering">
                                    <USelect :items="sortOptions" :model-value="filters.ordering || 'name'"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('ordering', value)" />
                                </UFormField>
                                <UFormField label="Candidate type" name="candidateType">
                                    <USelect :items="candidateTypeOptions"
                                        :model-value="filters.candidateType || 'all'" class="w-full"
                                        @update:model-value="(value) => updateFilter('candidateType', value)" />
                                </UFormField>
                                <UFormField label="Party" name="partyId">
                                    <USelect :items="partyOptions" :model-value="filters.partyId || 'all'"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('partyId', value)" />
                                </UFormField>
                            </div>
                        </UCard>
                    </template>
                    <template #content="{ items }">
                        <UCard variant="subtle">
                            <ElectionsResultsTable :columns="columns" :rows="rowsFor(items)"
                                lead-width="minmax(10rem, 20rem)" :bar-max="100" />
                        </UCard>
                    </template>
                </WContentPaginatedItems>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, ReferenceCandidate, ResultsVersion,
} from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { useResultsScope } from '~/composables/useElectionSource'
import { formatCount, formatPercent } from '~/utils/elections/format'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// Every candidate's tally, which means every electorate's results document.
// The most expensive view in the dashboard, and released as soon as it closes.
useResultsScope({ kind: 'all-electorates' })

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const reference = computed(() => store.referenceData(slugs.value.e, slugs.value.v))
const candidates = computed(() => reference.value?.candidates ?? [])
const parties = computed(() => [...(reference.value?.parties ?? [])]
    .sort((a, b) => (a.name || '').localeCompare(b.name || '')))

const defaultQueryParams = {
    search: '',
    ordering: 'name',
    candidateType: 'all',
    partyId: 'all',
}

const sortOptions = [
    { label: 'Name (A–Z)', value: 'name' },
    { label: 'Name (Z–A)', value: '-name' },
    { label: 'List ranking (highest first)', value: 'list_pos' },
    { label: 'List ranking (lowest first)', value: '-list_pos' },
]

const candidateTypeOptions = [
    { label: 'All candidates', value: 'all' },
    { label: 'Electorate candidates', value: 'electorate' },
    { label: 'List candidates', value: 'list' },
]

const partyOptions = computed(() => [
    { label: 'All parties', value: 'all' },
    ...parties.value.map(party => ({
        label: party.name || party.abbreviation || `Party ${party.number}`,
        // Parties are identified by their Electoral Commission number, which is
        // what a candidate's `party` refers to.
        value: String(party.number),
    })),
])

type Filters = Record<string, string | undefined>

const customFilter = (items: ReferenceCandidate[], filters: Filters) => {
    let filtered = [...items]

    const search = filters.search?.trim().toLowerCase()
    if (search) {
        filtered = filtered.filter(c => (c.name ?? '').toLowerCase().includes(search))
    }

    if (filters.candidateType === 'electorate') {
        filtered = filtered.filter(c => c.electorate !== null)
    } else if (filters.candidateType === 'list') {
        filtered = filtered.filter(c => c.list_pos !== null)
    }

    const partyId = filters.partyId
    if (partyId && partyId !== 'all') {
        filtered = filtered.filter(c => c.party === Number(partyId))
    }

    return filtered
}

const customSort = (items: ReferenceCandidate[], filters: Filters) => {
    const ordering = filters.ordering || 'name'
    const sorted = [...items]

    sorted.sort((a, b) => {
        if (ordering === 'name') return a.name.localeCompare(b.name)
        if (ordering === '-name') return b.name.localeCompare(a.name)

        // Candidates without a list ranking sort last either way.
        if (a.list_pos === null) return 1
        if (b.list_pos === null) return -1
        // A "highest" list ranking is the top of the list, which is number one.
        return ordering === 'list_pos' ? a.list_pos - b.list_pos : b.list_pos - a.list_pos
    })

    return sorted
}

const columns: ResultsColumn[] = [
    { key: 'electorate', label: 'Electorate', width: '10rem', secondary: true },
    { key: 'list_pos', label: 'List', width: '4rem', secondary: true },
    { key: 'count', label: 'Votes', width: '6rem' },
    { key: 'share', label: 'Share', width: '5rem' },
]

/** Candidate vote totals, indexed by candidate number. */
const candidateVotes = computed(() => {
    const totals = new Map<number, { count: number | null, share: number | null }>()
    for (const set of store.allResults(slugs.value.e, slugs.value.v)) {
        if (set.results_level !== 'electorate' || set.results_category !== 'candidate_votes') continue
        const cast = set.statistics.total_votes_cast
            ?? set.results.reduce((sum, r) => sum + (r.count ?? 0), 0)
        for (const result of set.results) {
            if (result.candidate === null) continue
            totals.set(result.candidate, {
                count: result.count,
                share: cast ? ((result.count ?? 0) / cast) * 100 : null,
            })
        }
    }
    return totals
})

function rowsFor(items: ReferenceCandidate[]): ResultsRow[] {
    return items.map(candidate => {
        const persistentParty = store.persistentPartyForCandidate(
            slugs.value.e, slugs.value.v, candidate.number)
        const persistentCandidate = store.persistentCandidateFor(
            slugs.value.e, slugs.value.v, candidate.number)
        const party = candidate.party === null
            ? null
            : store.party(slugs.value.e, slugs.value.v, candidate.party)
        const electorate = candidate.electorate === null
            ? null
            : store.electorate(slugs.value.e, slugs.value.v, candidate.electorate)
        const votes = candidateVotes.value.get(candidate.number)

        return {
            key: candidate.number,
            label: candidate.name,
            sublabel: party?.name ?? 'Independent',
            colour: persistentParty?.colour ?? null,
            // Where the candidate is a known person, link to their profile
            // rather than to a results-only page.
            to: persistentCandidate?.person
                ? `/people/${persistentCandidate.person}`
                : `/elections/${slugs.value.e}/${slugs.value.v}/candidates/${candidate.number}`,
            bar: votes?.share ?? null,
            cells: {
                electorate: electorate?.name ?? 'List only',
                list_pos: candidate.list_pos ?? '—',
                count: formatCount(votes?.count ?? null),
                share: formatPercent(votes?.share),
            },
        }
    })
}
</script>
