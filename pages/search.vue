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
import { AisInstantSearch, AisSearchBox, AisHits, AisRefinementList, AisStateResults, AisStats, AisHighlight } from 'vue-instantsearch/vue3/es'
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings'

const indexName = 'wts_v2_SiteSearch_prod'
const algolia = useAlgoliaRef()
const vueRouter = useRouter()

/** Convert Vue Router query to InstantSearch route state (Algolia bracket notation). */
function queryToRouteState(query) {
    const routeState = {}

    for (const [key, rawValue] of Object.entries(query)) {
        if (rawValue == null || rawValue === '') {
            continue
        }

        if (key === 'query') {
            routeState.query = Array.isArray(rawValue) ? rawValue[0] : rawValue
            continue
        }

        const refinementIndexed = /^refinementList\[([^\]]+)\]\[(\d+)\]$/.exec(key)
        if (refinementIndexed) {
            const [, attribute, index] = refinementIndexed
            if (!routeState.refinementList) {
                routeState.refinementList = {}
            }
            if (!routeState.refinementList[attribute]) {
                routeState.refinementList[attribute] = []
            }
            routeState.refinementList[attribute][Number(index)] = Array.isArray(rawValue) ? rawValue[0] : rawValue
            continue
        }

        if (key === 'refinementList' && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
            routeState.refinementList = rawValue
            continue
        }

        routeState[key] = rawValue
    }

    if (routeState.refinementList) {
        for (const attribute of Object.keys(routeState.refinementList)) {
            routeState.refinementList[attribute] = routeState.refinementList[attribute].filter(Boolean)
        }
    }

    return routeState
}

/** Convert InstantSearch route state to Vue Router query (Algolia bracket notation). */
function routeStateToQuery(routeState) {
    const query = {}

    if (routeState.query) {
        query.query = String(routeState.query)
    }

    if (routeState.refinementList) {
        for (const [attribute, values] of Object.entries(routeState.refinementList)) {
            const list = Array.isArray(values) ? values : [values]
            list.forEach((value, index) => {
                query[`refinementList[${attribute}][${index}]`] = String(value)
            })
        }
    }

    for (const [key, value] of Object.entries(routeState)) {
        if (key === 'query' || key === 'refinementList') {
            continue
        }
        query[key] = value
    }

    return query
}

function createInstantSearchRouter() {
    let removeAfterEach
    let onPopState

    const router = {
        read() {
            return queryToRouteState(vueRouter.currentRoute.value.query)
        },
        write(routeState) {
            const query = routeStateToQuery(routeState)
            if (router.createURL(routeState) === router.createURL(router.read())) {
                return
            }
            vueRouter.push({ query })
        },
        createURL(routeState) {
            return vueRouter.resolve({ query: routeStateToQuery(routeState) }).href
        },
        onUpdate(callback) {
            if (import.meta.server) {
                return
            }

            removeAfterEach = vueRouter.afterEach(() => {
                callback(router.read())
            })

            onPopState = () => {
                callback(router.read())
            }
            window.addEventListener('popstate', onPopState)
        },
        dispose() {
            if (import.meta.server) {
                return
            }
            if (onPopState) {
                window.removeEventListener('popstate', onPopState)
            }
            if (removeAfterEach) {
                removeAfterEach()
            }
        },
    }

    return router
}

const routing = {
    router: createInstantSearchRouter(),
    stateMapping: singleIndex(indexName),
}

definePageMeta({
    // InstantSearch + routing are client-only; SSR on Cloudflare Workers throws
    // "Code generation from strings disallowed for this context".
    ssr: false,
    robots: false,
})

</script>