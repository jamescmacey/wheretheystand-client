<template>
  <div id="bill-view" v-if="bill">
    <PageHeader :pageTitle="bill.name" :pageSubtitle="bill.type_desc"></PageHeader>
    <div class="container mt-3">
      <div class="row">
        <div class="col-12 col-lg-8">
          <h4>About this bill</h4>
          <Card>
            {{ bill.description }}

            <h5 class="mt-3" v-if="bill.voting_method != 'unk'">Voting method</h5>
            <span v-if="bill.voting_method == 'per'">
              <FontAwesomeIcon :icon="['fas', 'person']">
              </FontAwesomeIcon> <strong>Personal voting: </strong> MPs voted individually on this bill.
            </span>
            <span v-if="bill.voting_method == 'par'">
              <FontAwesomeIcon :icon="['fas', 'people-group']">
              </FontAwesomeIcon> <strong>Party voting: </strong> Parties decided whether or not to support this bill and
              cast votes on behalf of all their MPs.
            </span>
            <span v-if="bill.voting_method == 'mix'">
              <FontAwesomeIcon :icon="['fas', 'people-group']">
              </FontAwesomeIcon> / <FontAwesomeIcon :icon="['fas', 'person']"> </FontAwesomeIcon><strong>Mixed voting:
              </strong> Both personal and party voting were used at different stages of this bill's progression.
            </span>

            <h5 class="mt-3" v-if="bill.urgency_used || bill.extended_sittings_used">Procedural notes</h5>
            <ul class="procedural-list pb-0 ps-0">
              <li class="procedural-list" v-if="bill.urgency_used">
                <FontAwesomeIcon class="me-2" :icon="['fas', 'forward-fast']"> </FontAwesomeIcon>
                <strong>Urgency used: </strong> This bill was progressed through one or more stages using urgency. Urgency allows the Government to
                fast-track the legislative process by extending the sitting hours of the House of Representatives and
                skipping the select committee stage of a bill, and allows bills to pass through more than one stage per
                sitting day.
                <br><small>
                  <ExternalLinkInline
                    link="https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/what-is-urgency/">
                    Learn more about urgency</ExternalLinkInline>
                </small>
              </li>
            <li class="procedural-list" v-if="bill.extended_sittings_used">
              <FontAwesomeIcon class="me-2" :icon="['fa', 'calendar']"> </FontAwesomeIcon>
              <strong>Extended sittings used: </strong> This bill was progressed during one or more extended sittings of
              the House of Representatives. This enables MPs to meet for longer than normal to consider legislation. It does not alter the stages that a bill must pass through to become law.
              <br><small>
                <ExternalLinkInline
                  link="https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/a-closer-look-at-extended-hours/">
                  Learn more about extended sittings</ExternalLinkInline>
              </small>
            </li>
          </ul>

            <h5 class="mt-3" v-if="bill.pco_url || actUrl">Read the bill</h5>
            <span v-if="bill.pco_url">
              <FontAwesomeIcon class="me-2" :icon="['fas', 'file-lines']"></FontAwesomeIcon>Bill text:
              <ExternalLinkInline :link="bill.pco_url">
                {{ bill.name }} (legislation.govt.nz)</ExternalLinkInline>
            </span>
            <br v-if="bill.pco_url && actUrl">
            <span v-if="actUrl">
              <FontAwesomeIcon class="me-2" :icon="['fas', 'book']"></FontAwesomeIcon>Act text:
              <ExternalLinkInline :link="actUrl">
                {{ bill.enactment.act }} (legislation.govt.nz)</ExternalLinkInline>
            </span>
            <hr>
            <div class="row">
              <div v-if="!bill.parliament_api_id" class="col-12 col-xl-6">
                <ExternalLinkInline
                  :link="'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/document/' + bill.legacy_document_id">
                  View on Parliament website (legacy)</ExternalLinkInline>
              </div>
              <div v-else class="col-12 col-xl-6">
                <ExternalLinkInline :link="'https://bills.parliament.nz/v/6/' + bill.parliament_api_id">
                  View on Parliament website</ExternalLinkInline>
              </div>
              <div class="col-12 col-xl-6 text-xl-end">
                <BillCite :bill="bill"></BillCite>
                <DownloadLink class="ms-xl-2 me-xl-0" resourceType="bill" fileType="json" :friendlyName="bill.name"
                  :resourceId="bill.id"></DownloadLink>
              </div>
            </div>
          </Card>
          <h4 v-if="bill.people_responsible.length > 0">Member<span v-if="bill.people_responsible.length > 1">s</span>
            responsible</h4>
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
          <VoteSummaryBare v-else-if="bill.dates.first_reading_date" :reading="1" :passed="true"
            :date="bill.dates.first_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 1)" :passed="false"
            :reading="1" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 1" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>1st reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
        <div class="col-12 col-lg-4">
          <NuxtLink class='vote-link' v-if="secondReading" :to="'/votes/' + secondReading.id">
            <VoteSummary :vote="secondReading"></VoteSummary>
          </NuxtLink>
          <VoteSummaryBare v-else-if="bill.dates.second_reading_date" :reading="2" :passed="true"
            :date="bill.dates.second_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 2)" :passed="false"
            :reading="2" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 2" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>2nd reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
        <div class="col-12 col-lg-4">
          <NuxtLink class='vote-link' v-if="thirdReading" :to="'/votes/' + thirdReading.id">
            <VoteSummary :vote="thirdReading"></VoteSummary>
          </NuxtLink>
          <VoteSummaryBare v-else-if="bill.dates.third_reading_date" :reading="3" :passed="true"
            :date="bill.dates.third_reading_date"></VoteSummaryBare>
          <VoteSummaryBare v-else-if="bill.dates.defeated_date && (bill.defeated_at_reading === 3)" :passed="false"
            :reading="3" :date="bill.dates.defeated_date"></VoteSummaryBare>
          <Card v-else-if="!bill.defeated_at_reading || bill.defeated_at_reading >= 3" :missing='true'>
            <h6 class="text-uppercase text-muted"><strong>3rd reading</strong></h6>
            <h6 class="text-muted">This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>
          </Card>
        </div>
      </div>
      <p class="text-muted">Only reading votes are shown here; these votes determine whether the Bill progresses through
        Parliament. Other votes, such as votes on whether to amend parts of the Bill, can be seen in Hansard.</p>
      <p class="text-muted">Bill details last synced with the Parliament website {{ relativeDate }}. <br><small>({{
        formatDateTime(bill.last_retrieved) }})</small></p>
    </div>
  </div>
</template>

<style scoped>
.vote-link,
.vote-link:hover {
  color: black;
  text-decoration: none;
}

.procedural-list {
  list-style:none;
}

ul.procedural_list {
  padding: 0;
  list-style-type: none;
}

li.procedural-list {
  margin-bottom: 7px;
}
</style>

<script>
import { format, parse, formatDistanceToNow, parseISO } from 'date-fns'

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
    },
    formatDateTime(datetime) {
      return format(parseISO(datetime), "d MMMM yyyy 'at' HH:mm OOOO")
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
        unk: 'WhereTheyStand isn\'t sure what\'s happening with this Bill.',
        dis: 'This Bill has been discharged by Parliament, which means that it will not be progressing and will not become law.'
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
    actUrl() {
      if (!this.bill.enactment.act_number || !this.bill.enactment.act_year) {
        return null
      } else {
        return "https://legislation.govt.nz/act/results.aspx?search=ad_act___" + this.bill.enactment.act_year + "_" + this.bill.enactment.act_number + "__25_ac@bn@rn@dn@apub@aloc@apri@apro@aimp@bgov@bloc@bpri@bmem@rpub@rimp_ac@ainf@anif@aaif@aase@arep@bcur@rinf@rnif_a_aw_se_&p=1"
      }
    },
    relativeDate() {
      return formatDistanceToNow(parseISO(this.bill.last_retrieved)) + " ago"
    },
  }
}
</script>

<style scoped></style>
