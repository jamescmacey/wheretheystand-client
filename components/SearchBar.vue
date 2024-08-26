<template>
    <div class="mb-1">
        <form @submit.prevent="submit" method="get">
        <div class="input-group">
            <input type="text" class="form-control" v-model="searchQuery" id="q" name="q" placeholder="MP, electorate or party name">
            <button class="btn btn-primary" type="submit" id="button-addon2">Find</button>
        </div>
        </form>
        <small class="text-muted">Search provided by Algolia.</small>
    </div>
</template>

<style scoped>
input,
button {
    border-radius: var(--wts-card-border-radius);
}
</style>

<script>
export default {
    name: 'SearchBar',
    data() {
        return {
            searchQuery: ''
        }
    },
    methods: {
        async submit() {
            await navigateTo({
                path: '/search',
                query: {
                    query: this.searchQuery
                }
            })
        }
    }
}

</script>


  