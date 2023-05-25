<template>
  <div id="person-view" v-if="person">
    <Head>
        <Meta name="twitter:card" content="summary" />
        <Meta name="twitter:image" :content="person.image" />
        <Meta name="twitter:image:alt" :content="person.display_name" />

        <Meta property="og:image:alt" :content="person.display_name" />
        <Meta property="og:image" :content="person.image" />
        <Meta name="twitter:card" content="summary" />

    <Meta name="twitter:site" content="@wherestandnz" />
    <Meta name="twitter:title" :content="person.display_name + ' - WhereTheyStand'" />
    <Meta name="twitter:description" :content="person.description" />

    <Meta property="og:site_name" content="WhereTheyStand"/>
    <Meta property="og:locale" content="en_NZ" />

    <Meta property="og:description" :content="person.description" />
    <Meta property="og:title" :content="person.display_name + ' - WhereTheyStand'" />
    </Head>
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
    this.peopleStore.fetch(this.$route.params.id, true)
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
