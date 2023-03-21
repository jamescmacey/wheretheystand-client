<template>
  <div id="person-view" v-if="person">
    <PageHeader :pageTitle="person.display_name" :pageSubtitle="person.description" :image="person.image"
      :colour="person.colour" :pageLinks="links"></PageHeader>
    <NuxtPage :person="person"></NuxtPage>
  </div>
</template>

<script>
import { usePeopleStore } from '../../stores/people'

export default {
  name: 'Person',
  setup() {
    const peopleStore = usePeopleStore()
    return { peopleStore }
    
  },
  created() {
    this.peopleStore.fetch(this.$route.params.id).then(function(response) {
    })
    
  },
  computed: {
    links() {
      return [
        {
          to: '/people/' + this.$route.params.id,
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
    person() {
      return this.peopleStore.byIdentifier(this.$route.params.id)
    },
  }
}
</script>

<style scoped></style>
