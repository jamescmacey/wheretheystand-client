<template>
    <NuxtLink class="router-link" :to="party.absoluteURL">
        <Card>
            <h4>{{ party.primaryName }}</h4>
            <p class="mt-1 mb-0">{{ party.byline }}</p>
        </Card>
    </NuxtLink>
    
</template>

<script>
import { AisHighlight } from 'vue-instantsearch/vue3/es'

export default {
    name: 'SearchResultParty',
    components: {
        AisHighlight
    },
    props: {
        party: Object
    }
}

</script>

<style scoped>
.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
