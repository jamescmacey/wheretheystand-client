<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>Financial interests</h4>
        <p>Each year, Members of Parliament are required to declare their financial interests, along with other specified interests.</p>
        <p>This page shows all the interests that {{ person.display_name }} declared when the register was last compiled. From time to time, amendments are also made and are incorporated into the list you see here.</p>
        <external-link-button link="https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/" text="Learn more on the Parliament website"></external-link-button>
        <card v-if="interests && interests != {}">
          <h5>Interests for {{ person.display_name }} as at {{ formattedReportDate }}</h5>
          <div v-for="i in 12" :key="i">
            <div v-if="interestsForType(i).length">
            <h6><span class="text-muted">{{ i }} </span> {{ interestTypeDescription(i) }}</h6>
            <ul>
              <li v-for="(interest, j) in interestsForType(i)" :key="j">
                {{ interest.description }}
              </li>
            </ul>
            </div>
          </div>
        </card>
        <card :missing="true" class="text-center" v-else>
          <p><strong>No interests were found for {{ person.display_name }}</strong></p>
          <p>WhereTheyStand doesn't have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened.</p>
          <external-link-button link="https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/" text="View historic or new registers of financial interests on the Parliament website"></external-link-button>
        </card>
        <p v-if="hasChangedDebt" class="text-muted">An asterisk (*) denotes that the interest rate payable in relation to the debt is less than the normal market interest rate that applied at the time the debt was incurred, or, if the terms of the debt have been amended, at the time of that amendment.</p>
        <p v-if="interests && interests != {}" class="text-muted">Due to the original formatting of this material, some interests might exist on the same line.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '../../components/Card.vue'
import ExternalLinkButton from '../../components/ExternalLinkButton.vue'
var moment = require('moment')

export default {
  name: 'PersonInterests',
  components: {
    ExternalLinkButton,
    Card
  },
  methods: {
    interestsForType (type) {
      return this.interests.interests.filter((element) => {
        return (element.type === type.toString())
      })
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
    this.$store.dispatch('fetchPersonInterests', { identifier: this.$route.params.id })
  },
  computed: {
    person () {
      return this.$store.getters.personByIdentifier(this.$route.params.id)
    },
    interests () {
      return this.$store.getters.personInterestsByIdentifier(this.$route.params.id)
    },
    formattedReportDate () {
      return moment(this.interests.filing_date).format('D MMMM YYYY')
    },
    hasChangedDebt () {
      if (this.interests) {
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
