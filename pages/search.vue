<template>
  <div>
    <ais-instant-search :index-name="indexName" :search-client="algolia" :routing="routing">
  <PageHeader pageTitle="Search" pageSubtitle="Find bills, people, parties and electorates.">
    <template #search>
      <ais-search-box>
        <template v-slot="{ currentRefinement, isSearchStalled, refine }">
          <span :hidden="!isSearchStalled">Loading...</span>
          <div class="input-group input-group-lg my-0 mx-0 col-12 w-100">
            <input type="search"
            :value="currentRefinement"
            @input="refine($event.currentTarget.value)" class="form-control" placeholder="Search" aria-label="Search box" id="search">
          </div>
      </template>
      </ais-search-box>
    </template>
  </PageHeader>
  <div class="container">
    {{ searchQuery }}
    <div>
      <ais-refinement-list attribute="type" />
        <ais-hits>
          <template v-slot="{ items }">
            {{ items }}
            <Card v-for="item in items" :key="item.objectID">
              <h3>{{ item.primaryName }}</h3>
            </Card>
            <Card v-if="items.length === 0" :missing="true">
              <p>No results found!</p>
            </Card>
          </template>
        </ais-hits>
      
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
import { AisInstantSearch, AisSearchBox, AisHits, AisRefinementList } from 'vue-instantsearch/vue3/es'
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

