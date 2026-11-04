<template>
    <div class="pb-8">
        <ais-instant-search :index-name="indexName" :search-client="algolia" :routing="routing">
            <PageHeader pageTitle="Search" pageSubtitle="Find bills, people, parties and electorates.">
                <template #search>
                    <ais-search-box>
                        <template v-slot="{ currentRefinement, isSearchStalled, refine }">
                            <UInput :value="currentRefinement" @input="refine($event.currentTarget.value)"
                                placeholder="Search..." aria-label="Search box" size="xl" icon="i-lucide-search"
                                id="search" class="w-full" />
                        </template>
                    </ais-search-box>
                </template>
            </PageHeader>
            <UContainer>
                <div class="text-end my-2 text-muted text-sm">
                    <AisStats class="text-end" />
                </div>

                <UPageGrid>
                    <div>
                        <UCard variant="subtle">
                            <h4 class="text-lg font-bold mb-2">Filter by type</h4>
                            <ais-refinement-list attribute="type">
                                <template v-slot="{
                                    items,
                                    isShowingMore,
                                    isFromSearch,
                                    canToggleShowMore,
                                    refine,
                                    createURL,
                                    toggleShowMore,
                                    searchForItems,
                                    sendEvent,
                                }">
                                    <div class="space-y-2 mt-2">
                                        <span v-if="!items.length">No results found.</span>
                                        <UCheckbox v-for="item in items" :key="item.value" :model-value="item.isRefined"
                                            @update:model-value="refine(item.value)" :id="'refine' + item.value">
                                            <template #label>
                                                {{ item.label.charAt(0).toUpperCase() + item.label.slice(1) }}
                                            </template>
                                            <template #description>
                                                ({{ item.count.toLocaleString() }} results)
                                            </template>
                                        </UCheckbox>
                                    </div>
                                </template>
                            </ais-refinement-list>
                        </UCard>
                    </div>
                    <div class="col-span-2">
                        <ais-state-results>
                            <template v-slot="{ query }">
                                <ais-hits v-show="query.length > 0">
                                    <template v-slot="{ items }">
                                        <UCard variant="subtle" v-if="items.length > 0">
                                            <div class="space-y-4">
                                                <template v-for="item in items" :key="item.objectID">
                                                    <SearchPersonCard v-if="item.type === 'person'" :person="item.data" />
                                                    <SearchPartyCard v-else-if="item.type === 'party'" :party="item.data" />
                                                    <SearchElectorateCard v-else-if="item.type === 'electorate'" :electorate="item.data" />
                                                    <SearchBillCard v-else-if="item.type === 'bill'" :bill="item.data" />
                                                    <UPageCard v-else variant="soft" :title="item.name"
                                                        :description="item.description" :to="'#'" />
                                                </template>
                                            </div>
                                        </UCard>
                                        <UEmpty v-if="items.length === 0" icon="i-lucide-folder"
                                            title="No results found" variant="soft" description="Try using broader terms, and remember that this search function can't
                                                search the internal text of bills, votes or other documents." />
                                    </template>
                                </ais-hits>
                                <UEmpty v-if="query.length === 0" icon="i-lucide-search"
                                    title="Enter a search term above to begin" variant="subtle"
                                    description="Results will appear as you type." />
                            </template>
                        </ais-state-results>


                    </div>
                </UPageGrid>
            </UContainer>
        </ais-instant-search>
    </div>
</template>


<script setup>
import { AisInstantSearch, AisSearchBox, AisHits, AisRefinementList, AisStateResults, AisStats } from 'vue-instantsearch/vue3/es'
import { createInstantSearchRouting } from '~/utils/algolia/instantSearchRouter'

const indexName = useAlgoliaIndexName('SiteSearch')
const algolia = useNuxtApp().$algolia
const routing = createInstantSearchRouting(indexName, useRouter())

usePageSeo({
    title: 'Search',
    description: 'Find bills, people, parties and electorates on WhereTheyStand.',
})

definePageMeta({
    // InstantSearch + routing are client-only; SSR on Cloudflare Workers throws
    // "Code generation from strings disallowed for this context".
    ssr: false,
    robots: false,
})

</script>