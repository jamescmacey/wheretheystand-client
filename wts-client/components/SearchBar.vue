<template>
    <div class="mb-1">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="MP, electorate or party name">
            <button class="btn btn-primary" type="button" id="button-addon2">Find</button>
        </div>
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


  