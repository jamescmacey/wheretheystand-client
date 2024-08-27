<template>
  <div>
    <ais-instant-search :index-name="indexName" :search-client="algolia" :routing="routing">
  <PageHeader pageTitle="Search" pageSubtitle="Find bills, people, parties and electorates.">
    <template #search>
      <ais-search-box>
        <template v-slot="{ currentRefinement, isSearchStalled, refine }">
          <div class="input-group input-group-lg my-0 mx-0 col-12 w-100">
            <input type="search"
            :value="currentRefinement"
            @input="refine($event.currentTarget.value)" class="form-control" placeholder="Search..." aria-label="Search box" id="search">
          </div>
      </template>
      </ais-search-box>
    </template>
  </PageHeader>
  <div class="container">
    <AisStats class="col-12 text-end mt-2 text-muted"/>
    <div class="row">
      <div class="col-12 col-lg-3">
        <Card>
          <h4>Filter by type</h4>
          <ais-refinement-list attribute="type">
            <template
              v-slot="{
                items,
                isShowingMore,
                isFromSearch,
                canToggleShowMore,
                refine,
                createURL,
                toggleShowMore,
                searchForItems,
                sendEvent,
              }"
            >
              <ul style="list-style-type: none; padding-left: 0;">
                <li v-if="isFromSearch && !items.length" style="display: block;">No results.</li>
                <li v-for="item in items" :key="item.value" class="form-check" style="display: block;">
                  <input @click.prevent="refine(item.value)" class="form-check-input" type="checkbox" :checked="item.isRefined ? true : false" :id="'refine'+item.value">
                  <label @click.prevent="refine(item.value)" class="form-check-label" :for="'refine'+item.value" :style="{ fontWeight: item.isRefined ?  'bold' : '' }">
                    <ais-highlight attribute="item" :hit="item"/>
                    ({{ item.count.toLocaleString() }})
                  </label>
                </li>
              </ul>
            </template>
          </ais-refinement-list>
      </Card>
      </div>
      <div class="col-12 col-lg-9">
        <ais-state-results>
          <template v-slot="{ query }">
            <ais-hits v-show="query.length > 0">
              <template v-slot="{ items }">
               
                <div v-for="item in items" :key="item.objectID">
                <SearchResultElectorate v-if="item.type === 'Electorate'" :electorate="item"/>
                <SearchResultBill v-else-if="item.type === 'Bill'" :bill="item"/>
                <SearchResultPerson v-else-if="item.type === 'Person'" :person="item"/>
                <SearchResultParty v-else-if="item.type === 'Party'" :party="item"/>
                <Card v-else>
                  <h4>{{ item.primaryName }}</h4>
                </Card>
                </div>
                <Card v-if="items.length === 0" :missing="true">
                  <p><strong>No results were found.</strong></p>
                  <p>Try using broader terms, and remember that this search function can't search the internal text of bills, votes or other documents.</p>
                </Card>
              </template>
            </ais-hits>
            <Card v-show="query.length == 0" :missing="true">
                <p><strong>Enter a query above to begin.</strong></p>
                <p>Results will appear as you type.</p>
            </Card>
          </template>
        </ais-state-results>
      </div>
    </div>
  </div>
</ais-instant-search>
</div>
</template>

<style scoped>
input,
button,
select {
    border-radius: var(--wts-card-border-radius);
}

#search {
  border-radius: var(--wts-card-border-radius);
}
</style>

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

<!--
<script>
export default {
  name: 'Search',
  components: ['ExternalLinkInline', 'ExternalLinkButton'],
  setup () {
    const { result, search } = useAlgoliaSearch("wts_SearchObject_prod")
    return { result, search }
  },
  async onMounted() {
    await this.search("inquiry")
  }
}
</script>
-->

