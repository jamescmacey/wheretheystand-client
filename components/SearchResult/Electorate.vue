<template>
    <NuxtLink class="router-link" :to="electorate.absoluteURL">
        <Card>
            <h4>{{ electorate.primaryName }}</h4>
            <p class="mt-1 mb-0">{{ electorate.byline }}</p>
        </Card>
    </NuxtLink>
    
</template>

<script>

export default {
    name: 'SearchResultElectorate',
    props: {
        electorate: Object
    }
}

</script>

<style scoped>
.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
