<template>
  <div class="container">
      <div class="row mt-3">
        <div v-if="votes" class="col-12 col-lg-8">
          <h4>Personal voting history</h4>
          <div class="row">
            <div v-for="(value, key) in votesByBill.slice(0, voteCount)" :key="key" class="col-12 col-lg-6">
                <PersonPersonalVote :record="value"></PersonPersonalVote>
            </div>
          </div>
          <div v-if="votesByBill.length > voteCount">
              <DisplayControlButton v-on:click="voteCount = votesByBill.length">
                  <font-awesome-icon :icon="['fas', 'chevron-down']"></font-awesome-icon> Show all votes
              </DisplayControlButton>
          </div>
          <div v-else-if="(voteCount === votesByBill.length) && (voteCount > 4)">
            <DisplayControlButton v-on:click="voteCount = 4">
                  <font-awesome-icon :icon="['fas', 'chevron-up']"></font-awesome-icon> Show fewer votes
              </DisplayControlButton>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <h4>Voting similarity</h4>
          <div class="row">
            <div class="col-12">
              <Card :gradient="true">
                <p><strong>There isn't enough data to show who {{ person.display_name }} votes similarly to.</strong></p>
                <p>Once {{ person.display_name }} has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div v-if="bills" class="col-12">
          <h4>Bills responsible for</h4>
          <div class="row">
            <div v-for="bill in bills.slice(0, billCount)" class="col-12 col-md-6" :key="bill.id">
              <SmallBill :bill="bill"></SmallBill>
            </div>
          </div>
          <div v-if="bills.length > billCount">
              <DisplayControlButton v-on:click="billCount = bills.length">
                  <font-awesome-icon :icon="['fas', 'chevron-down']"></font-awesome-icon> Show all bills
              </DisplayControlButton>
          </div>
          <div v-else-if="(billCount === bills.length) && (billCount > 4)">
            <DisplayControlButton v-on:click="billCount = 4">
                  <font-awesome-icon :icon="['fas', 'chevron-up']"></font-awesome-icon> Show fewer bills
              </DisplayControlButton>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import Card from '../../components/Card.vue'
import SmallBill from '../../components/SmallBill.vue'
import PersonPersonalVote from '../../components/PersonPersonalVote.vue'
import DisplayControlButton from '../../components/DisplayControlButton.vue'

export default {
  name: 'PersonHome',
  components: {
    Card,
    SmallBill,
    PersonPersonalVote,
    DisplayControlButton
  },
  data () {
    return {
      voteCount: 4,
      billCount: 4
    }
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
      return Object.values(votes)
    }
  }
}
</script>

<style scoped>

</style>
