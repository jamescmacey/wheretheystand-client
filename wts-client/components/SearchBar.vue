<template>
    <div class="mb-1">
        <form action="/search/" method="get">
        <div class="input-group">
            <input type="text" class="form-control" id="q" name="q" placeholder="MP, electorate or party name">
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
}

</script>


  