<template>
    <ElectionsLayoutDashboardPage :heading="`${electorates.length} electorates`">
                <WContentPaginatedItems :items="electorates" :item-key="item => item.number" item-label="electorates"
                    :items-per-page="24" url-prefix="electorates" :query-params="defaultQueryParams" :sync-url="true"
                    :custom-filter="customFilter" :custom-sort="customSort">
                    <template #filters="{ filters, updateFilter }">
                        <UCard variant="subtle" class="mb-4">
                            <div class="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 gap-4">
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
                        <!-- The list needs about 1,010 px on 2023's names, so below 64rem
                             of content the reader's choice is set aside, and kept for
                             a wider window. Done in CSS because it follows the room
                             left by the feed panel, which the server cannot know. -->
                        <div class="hidden @5xl:flex justify-end mb-4">
                            <UFieldGroup>
                                <UButton icon="i-lucide-layout-grid" aria-label="Show as cards" color="neutral"
                                    :variant="view === 'cards' ? 'subtle' : 'outline'"
                                    :aria-pressed="view === 'cards'" @click="setView('cards')" />
                                <UButton icon="i-lucide-list" aria-label="Show as a list" color="neutral"
                                    :variant="view === 'list' ? 'subtle' : 'outline'"
                                    :aria-pressed="view === 'list'" @click="setView('list')" />
                            </UFieldGroup>
                        </div>

                        <ElectionsResultsElectorateResultsTable v-if="view === 'list'" class="hidden @5xl:block"
                            :election="election" :resultsVersion="resultsVersion" :electorates="items"
                            :result-for="resultFor" />
                        <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]"
                            :class="view === 'list' ? '@5xl:hidden' : ''">
                            <ElectionsResultsElectorateResultCard v-for="item in items" :key="item.number"
                                :election="election" :resultsVersion="resultsVersion" :electorate="item"
                                :result="resultFor(item.number)" />
                        </div>
                    </template>
                </WContentPaginatedItems>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type {
    ElectionSummary, EntityNumber, ReferenceElectorate, ResultsVersion,
} from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { useIncumbency } from '~/composables/useIncumbency'

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

// A cookie rather than local storage, so the server renders the view the reader
// chose and a reload does not flash the other one first.
const view = useCookie<'cards' | 'list'>('elections-electorates-view', {
    default: () => 'cards',
    maxAge: 60 * 60 * 24 * 365,
})

function setView(value: 'cards' | 'list') {
    view.value = value
}

const { flippedFor } = useIncumbency(() => props.election, () => props.resultsVersion)

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
    { label: 'Held electorates', value: 'held' },
    { label: 'Flipped electorates', value: 'flipped' },
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
        // Tied, uncounted and uncurated seats are neither, so drop out of both.
        const wanted = status === 'flipped'
        filtered = filtered.filter(e => flippedFor(e.number) === wanted)
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
