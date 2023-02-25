<template>
  <router-link class="router-link" :to="'/parties/' + party.slug">
    <Card :stripeColour="party.colour">
        <h5><strong>{{ party.display_name }}</strong></h5>
        <p v-if="party.seats">{{ party.seats }} seat<span v-if="party.seats != 1">s</span></p>
        <slot></slot>
    </Card>
  </router-link>
</template>

<script>
import Card from './Card.vue'
export default {
  name: 'PartyCard',
  components: {
    Card
  },
  props: {
    party: Object
  }
}
</script>

<style scoped>
.router-link,
.router-link:hover {
  color: black;
  text-decoration: none;
}

p {
  margin-top: 5px;
  margin-bottom: 0px;
}
</style>
