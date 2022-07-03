<template>
  <div id="bill-view" v-if="bill">
    <PageHeader :pageTitle="bill.name" :pageSubtitle="bill.type_desc"></PageHeader>
    <div class="container mt-3">
      <div class="row">
        <div class="col-12 col-lg-8">
          <h4>About this bill</h4>
          <Card>
            <p>{{ bill.description }}</p>
          </Card>
          <h4>Member<span v-if="bill.people_responsible.length > 1">s</span> responsible</h4>
          <div class="row">
            <div class="col-12 col-lg-6" v-for="person in bill.people_responsible" :key="person.id">
              <PersonCard :person="person"></PersonCard>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <h4>Progress</h4>
          <Card :gradient="true">
            <h3>{{ bill.progress_desc }}</h3>
            <p>{{ progressExplanation }}</p>
          </Card>
        </div>
      </div>
      <h3>Votes</h3>
      <div class="row">
        <div class="col-12 col-lg-4">
          <NuxtLink class='vote-link' v-if="firstReading" :to="'/votes/' + firstReading.id">
            <VoteSummary :vote="firstReading"></VoteSummary>
          </NuxtLink>
          <VoteSummaryBare v-else-if="bill.dates.first_reading_date" :reading="1" :passed="true" :date="bill.dates.first_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 1)" :passed="false" :reading="1" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 1" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>1st reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
        <div class="col-12 col-lg-4">
          <NuxtLink class='vote-link' v-if="secondReading" :to="'/votes/' + secondReading.id">
            <VoteSummary :vote="secondReading"></VoteSummary>
          </NuxtLink>
          <VoteSummaryBare v-else-if="bill.dates.second_reading_date" :reading="2" :passed="true" :date="bill.dates.second_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 2)" :passed="false" :reading="2" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 2" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>2nd reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
        <div class="col-12 col-lg-4">
          <NuxtLink class='vote-link' v-if="thirdReading" :to="'/votes/' + thirdReading.id">
            <VoteSummary :vote="thirdReading"></VoteSummary>
          </NuxtLink>
          <VoteSummaryBare v-else-if="bill.dates.third_reading_date" :reading="3" :passed="true" :date="bill.dates.third_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 3)" :passed="false" :reading="3" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 3" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>3rd reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
      </div>
      <p class="text-muted">Only reading votes are shown here; these votes determine whether the Bill progresses through
        Parliament. Other votes, such as votes on whether to amend parts of the Bill, can be seen in Hansard</p>
    </div>
  </div>
</template>

<style scoped>
.vote-link, .vote-link:hover {
  color: black;
  text-decoration: none;
}

</style>

<script>
import { format, parse } from 'date-fns'
import { useBillsStore } from '../../../stores/bills'

export default {
  name: 'Bill',
  setup() {
    const billsStore = useBillsStore()
    return { billsStore }
  },
  created() {
    this.billsStore.fetch(this.$route.params.id)
  },
  methods: {
    formatDate(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
    }
  },
  computed: {
    bill() {
      return this.billsStore.byID(this.$route.params.id)
    },
    progressExplanation() {
      if (!this.bill) {
        return ''
      } else if (this.bill.progress === 'inp') {
        if (this.bill.dates.whole_house_date) {
          return 'The Committee of the whole House concluded its consideration of this Bill on ' + this.formatDate(this.bill.dates.whole_house_date) + ' and the Bill is awaiting its third reading.'
        } else if (this.bill.dates.second_reading_date) {
          return 'This Bill passed its second reading on ' + this.formatDate(this.bill.dates.second_reading_date) + ' and is awaiting the Commitee of the whole House stage.'
        } else if (this.bill.dates.first_reading_date) {
          var msg = 'This Bill passed its first reading on ' + this.formatDate(this.bill.dates.introduction_date) + '. '
          if (this.bill.dates.report_back_date) {
            msg = msg + 'The Select Committee reported back on ' + this.formatDate(this.bill.dates.report_back_date) + ' and the Bill is awaiting its second reading. '
          } else if (this.bill.dates.submissions_due_date) {
            msg = msg + 'Public submissions are due on ' + this.formatDate(this.bill.dates.submissions_due_date) + '. '
          }
          return msg
        } else if (this.bill.dates.introduction_date) {
          return 'This Bill was introduced on ' + this.formatDate(this.bill.dates.introduction_date) + ' and is awaiting its first reading.'
        }
      }
      const EXPLANATIONS = {
        ena: 'This Bill has been passed by Parliament, and signed into law by the Governor-General in a step called Royal Assent. This doesn\'t mean that everything the Act implements has come into force yet, but it does mean that the Act is on the statute books.',
        pas: 'This Bill has been passed by Parliament, but hasn\'t been given Royal Assent by the Governor-General. This means that most of the work required to turn the Bill into law is complete, because in New Zealand, the Governor-General has never refused to give Royal Assent to legislation.',
        def: 'This Bill has been defeated in a vote of MPs, which means that it will not be progressing and will not become law.',
        wit: 'This Bill has been withdrawn, which means that it will not be progressing and will not become law.',
        lap: 'This Bill has lapsed. At the end of each Parliamentary term, bills which are still in progress lapse unless they are reinstated in the next term.',
        unx: 'This Bill is classed as \'not current\' on Parliament\'s website, which means it is likely that the Bill was either defeated or withdrawn. Unfortunately, WhereTheyStand has not been able to ascertain this information based on the Bill\'s page on the Parliament website.',
        div: 'This Bill has been divided into multiple bills.',
        unk: 'WhereTheyStand isn\'t sure what\'s happening with this Bill.'
      }

      return EXPLANATIONS[this.bill.progress]
    },
    firstReading() {
      return this.bill.votes.find(vote => vote.reading === 1)
    },
    secondReading() {
      return this.bill.votes.find(vote => vote.reading === 2)
    },
    thirdReading() {
      return this.bill.votes.find(vote => vote.reading === 3)
    },
  }
}
</script>

<style scoped>
</style>
