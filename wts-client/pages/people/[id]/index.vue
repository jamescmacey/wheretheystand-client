<template>
  <div class="container">
      <div class="row mt-3">
        <div class="col-12 col-lg-8">
          <h4>Personal voting history</h4>
          <p v-if="votes && votes.length === 0"><FontAwesomeIcon :icon="['fas', 'info-circle']"></FontAwesomeIcon> WhereTheyStand doesn't have any votes to show you.</p>
          <p v-else-if="!votes"><Spinner></Spinner> Loading...</p>
          <div v-if="votes" class="row">
            <div v-for="(value, key) in votesByBill.slice(0, voteCount)" :key="key" class="col-12 col-lg-6">
                <PersonPersonalVote :record="value"></PersonPersonalVote>
            </div>
          </div>
          <div v-if="votesByBill.length > voteCount">
              <DisplayControlButton v-on:click="voteCount = votesByBill.length">
                  <FontAwesomeIcon :icon="['fas', 'chevron-down']"></FontAwesomeIcon> Show all votes
              </DisplayControlButton>
          </div>
          <div v-else-if="(voteCount === votesByBill.length) && (voteCount > 4)">
            <DisplayControlButton v-on:click="voteCount = 4">
                  <FontAwesomeIcon :icon="['fas', 'chevron-up']"></FontAwesomeIcon> Show fewer votes
              </DisplayControlButton>
          </div>
        </div>
        <div v-if="votingSimilarity && votingSimilarity != {}" class="col-12 col-lg-4">
          <h4>Voting similarity</h4>
          <div class="row">
            <div class="col-12">
              <VotingSimilarityDisplay v-if="votingSimilarity.status == 'complete'" :person="person" :similarityReport="votingSimilarity">

              </VotingSimilarityDisplay>
              <Card :gradient="true" v-else-if="votingSimilarity.status == 'insufficient'">
                <p><strong>There isn't enough data to show who {{ person.display_name }} votes similarly to.</strong></p>
                <p>Once {{ person.display_name }} has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way. Personal votes don't happen often in New Zealand, so it may be some time.</p>
              </Card>
              <Card :gradient="true" v-else>
                <p><strong>WhereTheyStand hasn't checked who {{ person.display_name }} votes similarly to.</strong></p>
                <p>This feature is coming soon, so please check back at a later date.</p>
                <p>In the meantime, click on any voting record to see more information about that bill and its votes.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <h4>Bills responsible for</h4>
          <p v-if="bills && bills.length === 0" class="col-12 col-lg-8"><FontAwesomeIcon :icon="['fas', 'info-circle']"></FontAwesomeIcon> {{ person.display_name }} hasn't sponsored any bills. This doesn't include any member's bills that they might have sitting in the 'biscut tin' which haven't been drawn yet.</p>
          <p v-else-if="!bills"><Spinner></Spinner> Loading...</p>
          <div v-if="bills" class="row">
            <div v-for="bill in bills.slice(0, billCount)" class="col-12 col-md-6" :key="bill.id">
              <SmallBill :bill="bill"></SmallBill>
            </div>
          </div>
          <div v-if="bills && (bills.length > billCount)">
              <DisplayControlButton v-on:click="billCount = bills.length">
                  <FontAwesomeIcon :icon="['fas', 'chevron-down']"></FontAwesomeIcon> Show all bills
              </DisplayControlButton>
          </div>
          <div v-else-if="bills && (billCount === bills.length) && (billCount > 4)">
            <DisplayControlButton v-on:click="billCount = 4">
                  <FontAwesomeIcon :icon="['fas', 'chevron-up']"></FontAwesomeIcon> Show fewer bills
              </DisplayControlButton>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { usePeopleStore } from '../../../stores/people'

export default {
  name: 'PersonHome',
  setup() {
    const peopleStore = usePeopleStore()

    return { peopleStore }
  },
  data () {
    return {
      voteCount: 4,
      billCount: 4
    }
  },
  created () {
    this.peopleStore.fetchVotes(this.$route.params.id)
    this.peopleStore.fetchBills(this.$route.params.id)
    this.peopleStore.fetchVotingSimilarity(this.$route.params.id)
  },
  computed: {
    votes () {
      return this.peopleStore.votesByIdentifier(this.$route.params.id)
    },
    bills () {
      return this.peopleStore.billsByIdentifier(this.$route.params.id)
    },
    person () {
      return this.peopleStore.byIdentifier(this.$route.params.id)
    },
    votingSimilarity () {
      return this.peopleStore.votingSimilarityByIdentifier(this.$route.params.id)
    },
    votesByBill () {
      var votes = {}

      if (!this.votes || this.votes.length === 0) { return [] }

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
