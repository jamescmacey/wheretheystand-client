<template>
  <div class="container">
    <div class="row mt-3" v-if="details">
      <div class="col-12 col-md-6" v-if="details.twitter_user">
        <twitter-user-card :user="details.twitter_user"></twitter-user-card>
      </div>
    </div>
  </div>
</template>

<script>
import TwitterUserCard from '../../components/TwitterUserCard.vue'
export default {
  name: 'PersonDetails',
  components: {
    TwitterUserCard
  },
  data () {
    return {
    }
  },
  created () {
    this.$store.dispatch('fetchPersonDetails', { identifier: this.$route.params.id })
  },
  mounted () {
  },
  computed: {
    details () {
      return this.$store.getters.personDetailsByIdentifier(this.$route.params.id)
    }
  }
}
</script>

<style scoped>

</style>
