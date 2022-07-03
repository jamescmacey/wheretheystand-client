<template>
  <div id="vote-view" v-if="vote">
    <PageHeader :pageTitle="vote.bill.name" :pageSubtitle="readingOrdinal" :pageDate="vote.vote_date"></PageHeader>
    <div class="container mt-3">
      <VoteSummary :vote="vote" :countsOnly="true"></VoteSummary>
      <div class="row">
        <div class="col-12 col-md-6">
          <ExternalLinkButton :link="'https://www.parliament.nz/en/pb/hansard-debates/rhr/document/' + vote.document_id">View Hansard record</ExternalLinkButton>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { format, parse } from 'date-fns'
import { useVotesStore } from '../../../stores/votes'

export default {
  name: 'Vote',
  setup() {
    const votesStore = useVotesStore()
    return { votesStore }
  },
  created() {
    this.votesStore.fetch(this.$route.params.id)
  },
  methods: {
    formatDate(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
    }
  },
  computed: {
    vote() {
      return this.votesStore.byID(this.$route.params.id)
    },
    readingOrdinal() {
      return this.vote.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.vote.reading]
    }
  }
}
</script>

<style scoped>
</style>
