<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>Financial interests</h4>
        <p>Each year, Members of Parliament are required to declare their financial interests, along with other specified interests.</p>
        <p>This page shows all the interests that {{ person.display_name }} declared when the register was last compiled. From time to time, amendments are also made and are incorporated into the list you see here.</p>
        <ExternalLinkButton link="https://www.parliament.nz/en/mps-and-electorates/members-financial-interests/" text="Learn more on the Parliament website"></ExternalLinkButton>
        <Card v-if="interests && (Object.keys(interests).length !== 0)">
          <h5>Interests for {{ person.display_name }} as at {{ formattedReportDate }}</h5>
          <div v-for="i in 12" :key="i">
            <div v-if="interestsForType(i).length">
            <h6><span class="text-muted">{{ i }} </span> {{ interestTypeDescription(i) }}</h6>
            <ul>
              <li v-for="(interest, j) in interestsForType(i)" :key="j">
                {{ interest.description }}
                <span v-if="interest.nzbn_match.nzbn"><br v-if="interest.nzbn_match.entity_classifications_descs">
                  <span class="text-muted" v-if="interest.nzbn_match.entity_classifications_descs" v-for="(classification, k) in interest.nzbn_match.entity_classifications_descs" :key="k">{{ classification }}</span>
                  <br><small><ExternalLinkInline :link="'https://www.nzbn.govt.nz/mynzbn/nzbndetails/' + interest.nzbn_match.nzbn">View on NZBN Registry</ExternalLinkInline></small>
                </span>
              </li>
            </ul>
            </div>
          </div>
        </Card>
        <Card :missing="true" class="text-center" v-else>
          <p><strong>No interests were found for {{ person.display_name }}</strong></p>
          <p>WhereTheyStand doesn't have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened.</p>
          <ExternalLinkButton link="https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/" text="View historic or new registers of financial interests on the Parliament website"></ExternalLinkButton>
        </Card>
        <p v-if="hasChangedDebt" class="text-muted">An asterisk (*) denotes that the interest rate payable in relation to the debt is less than the normal market interest rate that applied at the time the debt was incurred, or, if the terms of the debt have been amended, at the time of that amendment.</p>
        <p v-if="interests && interests != {}" class="text-muted">Due to the original formatting of this material, some interests might exist on the same line.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { format, parse } from 'date-fns'
import { usePeopleStore } from '../../../stores/people'

export default {
  name: 'PersonInterests',
  setup() {
    const peopleStore = usePeopleStore()

    return { peopleStore }
  },
  methods: {
    interestsForType (type) {
      if (this.interests && (Object.keys(this.interests).length !== 0)) {
        return this.interests.interests.filter((element) => {
          return (element.type === type.toString())
        })
      } else { return []}
    },
    interestTypeDescription (type) {
      return {
        1: 'Company directorships and controlling interests',
        2: 'Other companies and business entities',
        3: 'Employment',
        4: 'Beneficial interests in, and trusteeships of, trusts',
        5: 'Organisations and trusts seeking Government funding',
        6: 'Real property',
        7: 'Retirement (superannuation) schemes',
        8: 'Investment schemes',
        9: 'Debtors (those who owe ' + this.person.display_name + ' money)',
        10: 'Creditors (those who ' + this.person.display_name + ' owes money to)',
        11: 'Overseas travel costs',
        12: 'Gifts',
        13: 'Discharged debts',
        14: 'Payments for activities'
      }[type]
    }
  },
  created () {
    this.peopleStore.fetchInterests(this.$route.params.id)
  },
  computed: {
    person () {
      return this.peopleStore.byIdentifier(this.$route.params.id)
    },
    interests () {
      return this.peopleStore.interestsByIdentifier(this.$route.params.id)
    },
    formattedReportDate () {
      if (this.interests && (Object.keys(this.interests).length !== 0)) { 
        console.log(this.interests)
        return format(parse(this.interests.filing_date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
      } else { return "" }
    },
    hasChangedDebt () {
      if (this.interests && (Object.keys(this.interests).length !== 0)) {
        return this.interests.interests.filter((element) => {
          return (element.description.endsWith('*'))
        })
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>

</style>
