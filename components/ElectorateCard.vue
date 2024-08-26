<template>
  <router-link class="router-link" :to="'/electorates/' + electorate.slug">
    <Card>
        <h5><strong>{{ electorate.name }}</strong></h5>
        <span class="text-muted text-uppercase">{{ electorate.type }}</span>
    </Card>
  </router-link>
</template>

<script>
import Card from './Card.vue'
export default {
  name: 'ElectorateCard',
  components: {
    Card
  },
  props: {
    electorate: Object
  }
}
</script>

<style scoped>
.router-link,
.router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
