<template>
  <div id="vote-view" v-if="vote">
    <Head>
    <Meta name="twitter:title" :content="vote.name + '- WhereTheyStand'" />
    <Meta v-if="vote.question_text" name="twitter:description" :content="vote.question_text" />
    <Meta v-if="vote.question_text" name="description" :content="vote.question_text" />
    <Meta property="og:title" :content="vote.name + '- WhereTheyStand'" />
    <Meta v-if="vote.question_text" property="og:description" :content="vote.question_text" />

    </Head>
    <PageHeader :pageTitle="vote.bill.name" :pageSubtitle="readingOrdinal" :pageDate="vote.vote_date" :backLink="'/bills/' + vote.bill.id" :backText="vote.bill.name"></PageHeader>
    <div class="container mt-3">
      <VoteSummary :vote="vote" :countsOnly="true"></VoteSummary>
      <h4>Summary</h4>
      <div class="row">
        <div class="col-12">
          <Card>
            <span v-if="vote.question_text">{{ vote.question_text }}</span>
            <strong v-if="vote.outcome_text"><br><FontAwesomeIcon :icon="['fas', 'arrow-right']"></FontAwesomeIcon>
            {{ vote.outcome_text }}</strong>
            <h5 class="mt-3">Vote type</h5>
            <span v-if="vote.type == 'personal'">
              <FontAwesomeIcon :icon="['fas', 'person']">
              </FontAwesomeIcon> <strong>Personal vote: </strong> MPs' votes were cast and recorded individually.
            </span>
            <span v-if="vote.type == 'party' && vote.contains_split_votes">
              <FontAwesomeIcon :icon="['fas', 'people-group']">
              </FontAwesomeIcon> <strong>Split-party vote: </strong> The vote was conducted as a party vote, but one or more parties opted to split their vote across multiple positions. The position of each MP within those parties is recorded individually.
            </span>
            <span v-if="vote.type == 'party' && !vote.contains_split_votes">
              <FontAwesomeIcon :icon="['fas', 'people-group']">
              </FontAwesomeIcon> <strong>Party vote: </strong> Parties cast one vote on behalf of all their MPs.
            </span>
            <hr>
            <div class="row">
              <div class="col-12 col-xl-6">
                <ExternalLinkInline :link="'https://www.parliament.nz/en/pb/hansard-debates/rhr/document/' + vote.document_id">
            View Hansard
            record</ExternalLinkInline>
              </div>
              <div class="col-12 col-xl-6 text-xl-end">
                <DownloadLink class="ms-xl-2 me-xl-0" resourceType="vote" fileType="xlsx" :resourceId="vote.id"></DownloadLink>
                <DownloadLink class="ms-xl-2 me-xl-0" resourceType="vote" fileType="csv" :resourceId="vote.id"></DownloadLink>
                <DownloadLink class="ms-xl-2 me-xl-0" resourceType="vote" fileType="json" :resourceId="vote.id"></DownloadLink>
              </div>
            </div>
            
          </Card>
        </div>

      </div>
      <div v-if="(vote.type == 'party')">
        <h5 v-if="ayes.length > 0" class="mt-3">Ayes</h5>
        <div v-if="ayes.length > 0" class="row">
          <div v-for="(position, i) in ayes" :key="i" class="col-12 col-md-6 col-lg-4 col-xl-3">
            <PartyCard v-if="!position.person" :party="position.party">
              {{ position.contribution }} vote<span v-if="position.contribution != 1">s</span>
            </PartyCard>
            <PersonCard v-else :person="position.person">
            </PersonCard>
          </div>
        </div>
        <h5 v-if="noes.length > 0" class="mt-3">Noes</h5>
        <div v-if="noes.length > 0" class="row">
          <div v-for="(position, i) in noes" :key="i" class="col-12 col-md-6 col-lg-4 col-xl-3">
            <PartyCard v-if="!position.person" :party="position.party">
              {{ position.contribution }} vote<span v-if="position.contribution != 1">s</span>
            </PartyCard>
            <PersonCard v-else :person="position.person">
            </PersonCard>
          </div>
        </div>
        <h5 v-if="abstentions.length > 0" class="mt-3">Abstentions</h5>
        <div v-if="abstentions.length > 0" class="row">
          <div v-for="(position, i) in abstentions" :key="i" class="col-12 col-md-6 col-lg-4 col-xl-3">
            <PartyCard v-if="!position.person" :party="position.party">
              {{ position.contribution }} vote<span v-if="position.contribution != 1">s</span>
            </PartyCard>
            <PersonCard v-else :person="position.person">
            </PersonCard>
          </div>
        </div>
        <h5 v-if="absences.length > 0" class="mt-3">Absences</h5>
        <div v-if="absences.length > 0" class="row">
          <div v-for="(position, i) in absences" :key="i" class="col-12 col-md-6 col-lg-4 col-xl-3">
            <PartyCard v-if="!position.person" :party="position.party">
              {{ position.contribution }} vote<span v-if="position.contribution != 1">s</span>
            </PartyCard>
            <PersonCard v-else :person="position.person">
            </PersonCard>
          </div>
        </div>

      </div>
      <div v-else>
        <div v-if="listMode == 'vote'">
          <h5 v-if="ayes.length > 0" class="mt-3">Ayes</h5>
          <Card class="col-12">
            <PersonList :positions="ayes"></PersonList>
          </Card>
          <h5 v-if="noes.length > 0" class="mt-3">Noes</h5>
          <Card v-if="noes.length > 0" class="col-12">
            <PersonList :positions="noes"></PersonList>
          </Card>
          <h5 v-if="abstentions.length > 0" class="mt-3">Abstentions</h5>
          <Card v-if="abstentions.length > 0" class="col-12">
            <PersonList :positions="abstentions"></PersonList>
          </Card>
          <h5 v-if="absences.length > 0" class="mt-3">Absences</h5>
          <Card v-if="absences.length > 0" class="col-12">
            <PersonList :positions="absences"></PersonList>
          </Card>
        </div>

      </div>
      <div class="col-12">
        <p class="text-muted">Last updated from Hansard {{ relativeDate }}. 
          <span v-if="vote.hansard_status.toLowerCase() == 'final'">The Hansard record that contains this vote is final.</span>
          <span v-else-if="vote.hansard_status.toLowerCase() == 'draft'">The Hansard record that contains this vote is in a draft state. Details of the vote are subject to change and the original Hansard will be checked regularly for updates.</span>
          <span v-else-if="vote.hansard_status.toLowerCase() == 'corrected'">The Hansard record that contains this vote is in the 'corrected' stage of publication, but it is not yet final. Minor changes are still possible.</span>
        </p>
      </div>
    </div>

  </div>
</template>

<script>
import { format, parse, formatDistanceToNow, parseISO } from 'date-fns'
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
  data() {
    return {
      listMode: "vote", // or "person"
      sortFunction: function (a, b) {
        if (a.person && b.person) {
          if (a.person.last_name.toLowerCase() < b.person.last_name.toLowerCase()) {
            return -1
          } else if (a.person.last_name.toLowerCase() == b.person.last_name.toLowerCase()) {
            return 0
          } else {
            return 1
          }
        } else if (a.person && !b.person) {
          return 1
        } else if (b.person && !a.person) {
          return -1
        } else if (!a.person && !b.person) {
          if (a.contribution > b.contribution) {
            return -1
          } else if (a.contribution < b.contribution) {
            return 1
          } else {
            if (a.party.display_name.toLowerCase() < b.party.display_name.toLowerCase()) {
              return -1
            } else if (a.party.display_name.toLowerCase() == b.party.display_name.toLowerCase()) {
              return 0
            } else {
              return 1
            }
          }
        }
      }
    }
  },
  computed: {
    vote() {
      return this.votesStore.byID(this.$route.params.id)
    },
    readingOrdinal() {
      return this.vote.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.vote.reading]
    },
    ayes() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == 'y') {
          return true
        }
      }).sort(this.sortFunction)
    },
    noes() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == 'n') {
          return true
        }
      }).sort(this.sortFunction)
    },
    abstentions() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == 'a') {
          return true
        }
      }).sort(this.sortFunction)
    },
    absences() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == 'x') {
          return true
        }
      }).sort(this.sortFunction)
    },
    relativeDate () {
      return formatDistanceToNow(parseISO(this.vote.last_retrieved)) + " ago"
    },
  }
}
</script>

<style scoped></style>
