<template>
  <div>
  <PageHeader pageTitle="Search WhereTheyStand"></PageHeader>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>What are you looking for today?</h4>
        <p>This page provides a high-level search of all resources on WhereTheyStand.</p>
        
      </div>
    </div>

    <div class="row mt-3">
                <ais-instant-search :search-client="searchClient" :search-function="searchFunction"
                    index-name="wts_SearchObject_prod">
                    <ais-configure v-bind="searchParameters"></ais-configure>
                    <ais-search-box />
                    <!--<ais-powered-by class="my-3"></ais-powered-by>-->
                    <ais-infinite-hits :class-names="{
                        'ais-InfiniteHits-item': 'ais-bills-hits-item'
                    }">
                        <template v-slot:item="{ item }">
                            <Card>
                                <h2>{{ item.primaryName }}</h2>
                            <p>{{ item.byline }}</p>
                            </Card>
                            
                        </template>
                    </ais-infinite-hits>
                </ais-instant-search>

            </div>
  </div>
</div>
</template>

<style>
.ais-bills-hits-item {
    background: transparent !important;
    display: block !important;
    padding: 0 !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    box-shadow: inherit !important;
    border-radius: inherit !important;
}

</style>


<script>
import algoliasearch from 'algoliasearch/lite'
import 'instantsearch.css/themes/satellite-min.css'

export default {
    name: 'Search',
    data() {
        return {
            searchClient: algoliasearch(
                'CRQORWX9YD',
                '0ba096387d4ce562803bec690404e72b'
            ),
            searchFunction(helper) {
                helper.addDisjunctiveFacetRefinement('type', 'Bill')
                helper.search()
            },
            searchParameters: {
                disjunctiveFacets: ["type"],
            }
        }
    }
}
</script>