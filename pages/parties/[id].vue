<template>
  <div id="party-view" v-if="party">
    <Head>
    <Meta name="twitter:title" :content="party.display_name + ' - WhereTheyStand'" />
    <Meta name="twitter:description" :content="pageSubtitle" />
    <Meta name="description" :content="pageSubtitle" />
    <Meta property="og:title" :content="party.display_name + ' - WhereTheyStand'" />
    <Meta property="og:description" :content="pageSubtitle" />

    </Head>
    <PageHeader :pageTitle="party.display_name" :pageSubtitle="pageSubtitle" :colour="party.colour" :pageLinks="links"></PageHeader>
    <NuxtPage :party="party"></NuxtPage>
  </div>
</template>

<script>
import { usePartiesStore } from '../../stores/parties'

export default {
  name: 'Party',
  setup() {
    const partiesStore = usePartiesStore()

    return { partiesStore }
  },
  created () {
    this.partiesStore.fetch(this.$route.params.id)
  },
  computed: {
    links () {
      return [
        {
          to: '/parties/' + this.$route.params.id,
          name: 'Overview'
        }
      ]
    },
    party () {
      return this.partiesStore.byIdentifier(this.$route.params.id)
    },
    pageSubtitle () {
      if (this.party.display_name != this.party.legal_name) {
        return this.party.legal_name
      }
    }
  }
}
</script>

<style scoped>

</style>
