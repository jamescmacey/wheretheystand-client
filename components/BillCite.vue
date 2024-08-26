<template>
    <a href="#" class="me-2">
        <font-awesome-icon class="me-1" :icon="['fas', 'pen-nib']"></font-awesome-icon>Cite
    </a>
</template>


<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}


</style>

<script>
export default {
    name: "BillCite",
    props: ['bill']
}

</script>