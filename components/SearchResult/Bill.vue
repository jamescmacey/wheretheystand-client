<template>
    <NuxtLink class="router-link" :to="bill.absoluteURL">
        <Card>
            <h4>{{ bill.primaryName }}</h4>
            <p class="mt-1 mb-0">
                <small class="me-1">
                        <span v-if="bill.badge_text == 'In progress'" class="badge bg-primary text-uppercase"> In progress</span>
                        <span v-else-if="bill.badge_text == 'Passed'" class="badge bg-success text-uppercase"> Passed</span>
                        <span v-else-if="bill.badge_text == 'Enacted'" class="badge bg-success text-uppercase"> Enacted</span>
                        <span v-else-if="bill.badge_text == 'Discharged'" class="badge bg-warning text-dark text-uppercase"> Discharged</span>
                        <span v-else-if="bill.badge_text == 'Defeated'" class="badge bg-danger text-uppercase"> Defeated</span>
                        <span v-else-if="bill.badge_text == 'Lapsed'" class="badge bg-danger text-uppercase"> Lapsed</span>
                        <span v-else-if="bill.badge_text == 'Unknown'" class="badge bg-danger text-uppercase"> Unknown</span>
                        <span v-else-if="bill.badge_text == 'Divided'" class="badge bg-info text-uppercase"> Divided</span>
                        <span v-else-if="bill.badge_text == 'Withdrawn'" class="badge bg-warning text-dark text-uppercase"> Withdrawn</span>
                        <span v-else class="badge bg-secondary text-uppercase"> -</span>
                    </small>
                <ais-highlight v-if="bill.byline" attribute="byline" :hit="bill" /><span v-else class="text-muted">No description.</span></p>
        </Card>
    </NuxtLink>
    
</template>

<script>
import { AisHighlight } from 'vue-instantsearch/vue3/es'

export default {
    name: 'SearchResultBill',
    components: {
        AisHighlight
    },
    props: {
        bill: Object
    }
}

</script>

<style scoped>
.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
