<template>
    <div>
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
                    <UPageGridItem>
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
                                                <ais-highlight attribute="item" :hit="item" />
                                            </template>
                                            <template #description>
                                                ({{ item.count.toLocaleString() }} results)
                                            </template>
                                        </UCheckbox>
                                    </div>
                                </template>
                            </ais-refinement-list>
                        </UCard>
                    </UPageGridItem>
                    <UPageGridItem class="col-span-2">
                        <ais-state-results>
                            <template v-slot="{ query }">
                                <ais-hits v-show="query.length > 0">
                                    <template v-slot="{ items }">
                                        <UCard variant="subtle" v-if="items.length > 0">
                                            <div class="space-y-4">
                                                <UPageCard v-for="item in items" :key="item.objectID"
                                                    variant="soft" :title="item.primaryName" :description="item.byline" :to="item.absoluteURL" />
                                            </div>
                                        </UCard>
                                        <UEmpty v-if="items.length === 0" icon="i-lucide-folder"
                                            title="No results found" variant="subtle" description="Try using broader terms, and remember that this search function can't
                                                search the internal text of bills, votes or other documents." />
                                    </template>
                                </ais-hits>
                                <UEmpty v-if="query.length === 0" icon="i-lucide-search"
                                    title="Enter a search term above to begin" variant="subtle"
                                    description="Results will appear as you type." />
                            </template>
                        </ais-state-results>


                    </UPageGridItem>
                </UPageGrid>
            </UContainer>
        </ais-instant-search>
    </div>
</template>


<script setup>
const indexName = 'wts_SearchObject_prod'
const algolia = useAlgoliaRef()
const route = useRoute()
import { AisInstantSearch, AisSearchBox, AisHits, AisRefinementList, AisStateResults, AisStats, AisHighlight } from 'vue-instantsearch/vue3/es'
import { history } from 'instantsearch.js/es/lib/routers';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';

const routing = ref({
    router: history(),
    stateMapping: singleIndex("wts_SearchObject_prod"),
})

const searchQuery = ref('')
if (route.query.query && typeof route.query.query === 'string') {
    searchQuery.value = route.query.query
}

</script>