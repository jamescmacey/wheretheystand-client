<template>
  <div id="party-view" v-if="party">
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
        },
        {
          to: '/parties/' + this.$route.params.id + '/documents',
          name: 'Documents'
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
