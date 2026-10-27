<template>
    <ElectionsLayoutDashboardPage title="Electorates" :heading="`${electorates.length} electorates`">
                <WContentPaginatedItems :items="electorates" :item-key="item => item.number" item-label="electorates"
                    :items-per-page="24" url-prefix="electorates" :query-params="defaultQueryParams" :sync-url="true"
                    :custom-filter="customFilter" :custom-sort="customSort">
                    <template #filters="{ filters, updateFilter }">
                        <UCard variant="subtle" class="mb-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <UFormField label="Search by name" name="search">
                                    <UInput :model-value="filters.search || ''" placeholder="Search electorates…"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('search', value)" />
                                </UFormField>
                                <UFormField label="Sort by" name="ordering">
                                    <USelect :items="sortOptions" :model-value="filters.ordering || 'name'"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('ordering', value)" />
                                </UFormField>
                                <UFormField label="Electorate type" name="electorateType">
                                    <USelect :items="electorateTypeOptions"
                                        :model-value="filters.electorateType || 'all'" class="w-full"
                                        @update:model-value="(value) => updateFilter('electorateType', value)" />
                                </UFormField>
                                <UFormField label="Status" name="resultStatus">
                                    <USelect :items="resultStatusOptions" :model-value="filters.resultStatus || 'all'"
                                        class="w-full"
                                        @update:model-value="(value) => updateFilter('resultStatus', value)" />
                                </UFormField>
                            </div>
                        </UCard>
                    </template>
                    <template #content="{ items }">
                        <UPageGrid>
                            <ElectionsResultsElectorateResultCard v-for="item in items" :key="item.number"
                                :election="election" :resultsVersion="resultsVersion" :electorate="item"
                                :result="resultFor(item.number)" />
                        </UPageGrid>
                    </template>
                </WContentPaginatedItems>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ReferenceElectorate, ResultsVersion,
} from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'

const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// No subscription of its own. Every electorate's leader and margin used to
// mean every electorate's results document -- 144 of them, re-billed on every
// change -- and now comes from the summary document the source layer already
// watches throughout a live count.
const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const electorates = computed(() =>
    store.referenceData(slugs.value.e, slugs.value.v)?.electorates ?? [])

const computedResults = computed(() =>
    store.computedElectorateResults(slugs.value.e, slugs.value.v))

const resultFor = (number: EntityNumber) => computedResults.value.get(number) ?? null

const defaultQueryParams = {
    search: '',
    ordering: 'name',
    electorateType: 'all',
    resultStatus: 'all',
}

const sortOptions = [
    { label: 'Name (A–Z)', value: 'name' },
    { label: 'Name (Z–A)', value: '-name' },
    { label: 'Closest margin first', value: 'margin' },
    { label: 'Widest margin first', value: '-margin' },
]

const electorateTypeOptions = [
    { label: 'All electorates', value: 'all' },
    { label: 'General electorates', value: 'general' },
    { label: 'Māori electorates', value: 'maori' },
]

const resultStatusOptions = [
    { label: 'All electorates', value: 'all' },
    { label: 'Leading candidate known', value: 'determined' },
    { label: 'Too close to call', value: 'indeterminate' },
    { label: 'Not counted yet', value: 'uncounted' },
]

type Filters = Record<string, string | undefined>

const customFilter = (items: ReferenceElectorate[], filters: Filters) => {
    let filtered = [...items]

    const search = filters.search?.trim().toLowerCase()
    if (search) {
        filtered = filtered.filter(e => e.name.toLowerCase().includes(search))
    }

    const type = filters.electorateType
    if (type && type !== 'all') {
        filtered = filtered.filter(e =>
            store.persistentElectorateFor(slugs.value.e, slugs.value.v, e.number)
                ?.electorate_type === type)
    }

    const status = filters.resultStatus
    if (status && status !== 'all') {
        filtered = filtered.filter(e => {
            const result = resultFor(e.number)
            // No results document at all, and one where nothing has been
            // counted, are the same thing to a reader.
            if (status === 'uncounted') return !result || result.resultStatus === 'uncounted'
            return result?.resultStatus === status
        })
    }

    return filtered
}

const customSort = (items: ReferenceElectorate[], filters: Filters) => {
    const ordering = filters.ordering || 'name'
    const sorted = [...items]

    sorted.sort((a, b) => {
        if (ordering === 'name') return a.name.localeCompare(b.name)
        if (ordering === '-name') return b.name.localeCompare(a.name)

        // Electorates with no margin yet sort last either way, rather than
        // appearing to be the closest races.
        const marginA = resultFor(a.number)?.marginPercentage
        const marginB = resultFor(b.number)?.marginPercentage
        if (marginA === null || marginA === undefined) return 1
        if (marginB === null || marginB === undefined) return -1
        return ordering === 'margin' ? marginA - marginB : marginB - marginA
    })

    return sorted
}
</script>
