<template>
  <div class="container">
    <div class="row">
      <div class="col-12 col-md-6">
        {{ person.description }}
      </div>
      <div class="col-12 col-md-6">
        <card>
          <h5>Social media</h5>
          <ul>Twitter <font-awesome-icon :icon="['fas', 'user-secret']" /></ul>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '../../components/Card.vue'
export default {
  name: 'PersonExpenses',
  components: {
    Card
  },
  computed: {
    person () {
      return this.$store.getters.personByIdentifier(this.$route.params.id)
    }
  }
}
</script>

<style scoped>

</style>
