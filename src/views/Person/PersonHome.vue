<template>
  <div class="container">
      <div class="row mt-3">
        <div v-if="votes" class="col-12 col-lg-8">
          <h4>Personal voting history</h4>
          <div class="row">
            <div v-for="(value, key) in votesByBill" :key="key" class="col-12 col-lg-6">
              <PersonPersonalVote :record="value"></PersonPersonalVote>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <h4>Voting similarity</h4>
          <div class="row">
            <div class="col-12">
              <Card missing="true">
                <p><strong>There isn't enough data to show who {{ person.display_name }} votes similarly to.</strong></p>
                <p>Once {{ person.display_name }} has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div v-if="bills" class="col-12">
        <h4>Bills responsible for</h4>
        <div class="row">
          <div v-for="bill in bills" class="col-12 col-md-6" :key="bill.id">
            <SmallBill :bill="bill"></SmallBill>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import Card from '../../components/Card.vue'
import SmallBill from '../../components/SmallBill.vue'
import PersonPersonalVote from '../../components/PersonPersonalVote.vue'

export default {
  name: 'PersonHome',
  components: {
    Card,
    SmallBill,
    PersonPersonalVote
  },
  created () {
    this.$store.dispatch('fetchPersonVotes', { identifier: this.$route.params.id })
    this.$store.dispatch('fetchPersonBills', { identifier: this.$route.params.id })
  },
  computed: {
    votes () {
      return this.$store.getters.personVotesByIdentifier(this.$route.params.id)
    },
    bills () {
      return this.$store.getters.personBillsByIdentifier(this.$route.params.id)
    },
    person () {
      return this.$store.getters.personByIdentifier(this.$route.params.id)
    },
    votesByBill () {
      var votes = {}

      this.votes.forEach((vote) => {
        if (!(vote.vote.bill.id in votes)) {
          votes[vote.vote.bill.id] = {
            bill: vote.vote.bill,
            votes: {
              1: {},
              2: {},
              3: {}
            }
          }
        }

        votes[vote.vote.bill.id].votes[vote.vote.reading] = {
          position: vote.position,
          date: vote.date
        }
      })
      return votes
    }
  }
}
</script>

<style scoped>

</style>
