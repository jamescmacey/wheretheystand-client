<template>
  <div id="person-view" v-if="person">
    <page-header :pageTitle="person.display_name" :pageSubtitle="person.description" :image="person.image" :colour="person.colour" :pageLinks="links"></page-header>
    <router-view :person="person"></router-view>
  </div>
</template>

<script>
import PageHeader from '../components/PageHeader.vue'

export default {
  name: 'Person',
  components: {
    PageHeader
  },
  created () {
    this.$store.dispatch('fetchPerson', { identifier: this.$route.params.id })
  },
  computed: {
    links () {
      return [
        {
          to: '/people/' + this.$route.params.id + '/overview',
          name: 'Overview'
        },
        {
          to: '/people/' + this.$route.params.id + '/details',
          name: 'Details'
        },
        {
          to: '/people/' + this.$route.params.id + '/interests',
          name: 'Interests'
        },
        {
          to: '/people/' + this.$route.params.id + '/expenses',
          name: 'Expenses'
        }
      ]
    },
    person () {
      return this.$store.getters.personByIdentifier(this.$route.params.id)
    }
  }
}
</script>

<style scoped>

</style>
