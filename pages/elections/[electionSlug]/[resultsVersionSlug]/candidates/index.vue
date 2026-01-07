<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #title>
                    Candidates
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto pt-0">
                <div class="flex flex-col gap-4 px-4">
                    <div>
                        <h2 class="text-2xl font-bold">{{ candidates.length }} candidates</h2>
                    </div>
                    <ContentPaginatedItems :items="candidates" :item-key="item => item.number" item-label="candidates"
                        :items-per-page="10" url-prefix="candidates" :query-params="defaultQueryParams" :sync-url="true"
                        :custom-filter="customFilter" :custom-sort="customSort">
                        <template #filters="{ filters, updateFilter }">
                            <UCard variant="subtle" class="mb-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <UFormField label="Search by name" name="search">
                                        <UInput :model-value="filters.search || ''"
                                            @update:model-value="(value) => updateFilter('search', value)"
                                            placeholder="Search candidates..." class="w-full" />
                                    </UFormField>
                                    <UFormField label="Sort by" name="ordering">
                                        <USelect :items="sortOptions" :model-value="filters.ordering || 'name'"
                                            @update:model-value="(value) => updateFilter('ordering', value)"
                                            placeholder="Sort by..." class="w-full" />
                                    </UFormField>
                                    <UFormField label="Candidate type" name="candidateType">
                                        <USelect :items="candidateTypeOptions"
                                            :model-value="filters.candidateType || 'all'"
                                            @update:model-value="(value) => updateFilter('candidateType', value)"
                                            placeholder="All candidates" class="w-full" />
                                    </UFormField>
                                    <UFormField label="Party" name="partyId">
                                        <USelect :items="partyOptions" :model-value="filters.partyId || 'all'"
                                            @update:model-value="(value) => updateFilter('partyId', value)"
                                            placeholder="All parties" class="w-full" />
                                    </UFormField>
                                </div>
                            </UCard>
                        </template>
                        <template #content="{ items }">
                            <UPageCard variant="subtle">
                                <div v-for="(item, index) in items" :key="item.number">
                                    <UPageCard variant="naked"
                                        :to="'/elections/' + election.slug + '/' + resultsVersion.slug + '/candidates/' + item.number">
                                        <template #body>
                                            <div class="flex items-center space-x-2">
                                                <div class="flex-shrink-0 w-2 self-stretch flex items-center justify-center rounded-md"
                                                    :style="{ backgroundColor: electionDataStore.getPersistentPartyForCandidate(election.slug, resultsVersion.slug, item)?.colour || '#000000' }">
                                                </div>
                                                <div class="flex flex-col">
                                                    {{ item.name }}
                                                    <p class="text-muted">{{ electionDataStore.getPartyForCandidate(election.slug, resultsVersion.slug,
                                            item)?.name || 'Independent' }}
                                            | {{ electionDataStore.getElectorateForCandidate(election.slug,
                                                resultsVersion.slug, item)?.name || 'List only' }}
                                            {{ item.list_pos ? '| ' + item.list_pos + ' on list' : '' }}</p>
                                                </div>
                                            </div>


                                            
                                        </template>
                                    </UPageCard>
                                    <USeparator v-if="index < items.length - 1" class="my-4" />
                                </div>
                            </UPageCard>
                        </template>
                    </ContentPaginatedItems>
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup>
const props = defineProps({
    election: {
        type: Object,
        required: true
    },
    resultsVersion: {
        type: Object,
        required: true
    }
})

const electionDataStore = useElectionDataStore()
const candidates = computed(() =>
    electionDataStore.getReferenceData(props.election.slug, props.resultsVersion.slug)?.candidates ?? []
)

// Get parties from reference data
const parties = computed(() =>
    electionDataStore.getReferenceData(props.election.slug, props.resultsVersion.slug)?.parties ?? []
)
const uniqueParties = computed(() => {
    const partyMap = new Map()

    // First, add parties from the parties list
    parties.value.forEach(party => {
        if (party.id && !partyMap.has(party.id)) {
            partyMap.set(party.id, party)
        }
    })

    return Array.from(partyMap.values()).sort((a, b) => {
        const nameA = a.name || a.abbreviation || ''
        const nameB = b.name || b.abbreviation || ''
        return nameA.localeCompare(nameB)
    })
})

// Default query params
const defaultQueryParams = {
    search: '',
    ordering: 'name',
    candidateType: 'all',
    partyId: 'all'
}

// Sort options
const sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: '-name' },
    { label: 'List ranking (lowest first)', value: 'list_pos' },
    { label: 'List ranking (highest first)', value: '-list_pos' }
]

// Candidate type options
const candidateTypeOptions = [
    { label: 'All candidates', value: 'all' },
    { label: 'Electorate candidates', value: 'electorate' },
    { label: 'List candidates', value: 'list' }
]

// Party options (only include parties that have at least one candidate)
const partyOptions = computed(() => {
    const options = [{ label: 'All parties', value: 'all' }]
    // Get a Set of party IDs that have candidates
    const candidatePartyIds = new Set(candidates.value.map(candidate => candidate.party).filter(Boolean))
    uniqueParties.value.forEach(party => {
        if (candidatePartyIds.has(party.id)) {
            const name = party.name || party.abbreviation || `Party ${party.id}`
            options.push({ label: name, value: party.id })
        }
    })
    return options
})

// Custom filter function for candidates
const customFilter = (items, filters) => {
    let filtered = [...items]

    // Apply name search filter (case-insensitive)
    const search = filters.search
    if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim()
        filtered = filtered.filter(c => {
            const name = c.name || ''
            return name.toLowerCase().includes(searchLower)
        })
    }

    // Apply candidate type filter
    const candidateType = filters.candidateType
    if (candidateType === 'electorate') {
        filtered = filtered.filter(c => c.electorate !== null && c.electorate !== undefined)
    } else if (candidateType === 'list') {
        filtered = filtered.filter(c => c.list_pos !== null && c.list_pos !== undefined)
    }
    // If candidateType is 'all', empty string, or undefined, don't filter

    // Apply party filter
    const partyId = filters.partyId
    if (partyId && partyId !== 'all' && partyId !== '') {
        filtered = filtered.filter(c => {
            if (typeof c.party === 'string' && c.party !== null) {
                return c.party === partyId
            }
            return false
        })
    }

    return filtered
}

// Custom sort function for candidates
const customSort = (items, filters) => {
    const sorted = [...items]
    const ordering = filters.ordering || 'name'

    sorted.sort((a, b) => {
        if (ordering === 'name') {
            return a.name.localeCompare(b.name)
        } else if (ordering === '-name') {
            return b.name.localeCompare(a.name)
        } else if (ordering === 'list_pos') {
            // Sort by list_pos, with nulls at the end
            if (a.list_pos === null || a.list_pos === undefined) return 1
            if (b.list_pos === null || b.list_pos === undefined) return -1
            return b.list_pos - a.list_pos // Highest first
        } else if (ordering === '-list_pos') {
            // Sort by list_pos, with nulls at the end
            if (a.list_pos === null || a.list_pos === undefined) return 1
            if (b.list_pos === null || b.list_pos === undefined) return -1
            return a.list_pos - b.list_pos // Lowest first
        }
        return 0
    })

    return sorted
}
</script>