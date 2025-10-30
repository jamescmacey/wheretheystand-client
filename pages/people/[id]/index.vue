<template>
  {{ person.display_name }} {{ votes.length }} {{ bills.length }}
  <div v-for="vote in votes" :key="vote.id">
    {{ vote.vote.bill.title }} {{ vote.position }} {{ vote.date }}
  </div>
  <div v-for="bill in bills" :key="bill.id">
    {{ bill.title }} {{ bill.description }}
  </div>
  <div v-for="voteByBill in votesByBill" :key="voteByBill.id">
    {{ voteByBill.bill.title }} {{ voteByBill.votes.length }}
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