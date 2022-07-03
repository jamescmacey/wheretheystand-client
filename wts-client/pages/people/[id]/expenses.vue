<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>Expenses and donations</h4>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <Card v-if="mpExpenses && mpExpenses != {}">
          <h5>MP expenses</h5>
          <p>These expenses are those incurred by {{ person.display_name }} as a Member of Parliament, and are prepared by the Parliamentary Service. They do not include executive (Ministerial) expenses, since these are prepared by the Department of Internal Affairs and are categorised differently.</p>
          <Grid :columns="['Period','Wellington accommodation','Rest of New Zealand accommodation', 'Air travel', 'Surface travel', 'VIP Transport', 'Grand Total', 'Overseas Inter-Parliamentary travel']" :rows="mpExpensesRows">
          </Grid>
        </Card>
        <Card :missing="true" class="text-center" v-else>
          <p><strong>No MP expenses were found for {{ person.display_name }}</strong></p>
        </Card>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <Card v-if="execExpenses && execExpenses != {}">
          <h5>Executive expenses</h5>
          <p>These expenses are those incurred by {{ person.display_name }} as a member of the executive, and are prepared by the Department of Internal Affairs. Expenses relating to when {{ person.display_name }} was a Member of Parliament are prepared by the Parliamentary Service and are categorised differently.</p>
          <Grid :columns="['Period','Wellington accommodation','Rest of New Zealand accommodation', 'Domestic air travel', 'Domestic surface travel', 'Domestic total', 'Cabinet-approved overseas travel']" :rows="execExpensesRows">
          </Grid>
        </Card>
        <Card :missing="true" class="text-center" v-else>
          <p><strong>No executive expenses were found for {{ person.display_name }}</strong></p>
        </Card>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <Card v-if="returns && returns != {}">
          <h5>Election returns for {{ person.display_name }}</h5>
          <Grid :columns="['Election','Electorate','Donations', 'Expenses']" :rows="returnsRows">
          </Grid>
        </Card>
        <Card :missing="true" class="text-center" v-else>
          <p><strong>No election returns were found for {{ person.display_name }}</strong></p>
          <p>WhereTheyStand only has election returns for 2017 and onwards. Only candidates who stand for election in an electorate submit these returns; list only candidates do not.</p>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import { usePeopleStore } from '../../../stores/people'

export default {
  name: 'PersonExpenses',
  setup() {
    const peopleStore = usePeopleStore()

    return { peopleStore }
  },
  created () {
    this.peopleStore.fetchMpExpenses(this.$route.params.id)
    this.peopleStore.fetchExecExpenses(this.$route.params.id)
    this.peopleStore.fetchReturns(this.$route.params.id)
  },
  methods: {
    formatCurrency (amount) {
      var formatter = new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD'
      })
      if (amount != null) {
        return formatter.format(amount)
      } else {
        return '-'
      }
    }
  },
  computed: {
    person () {
      return this.peopleStore.byIdentifier(this.$route.params.id)
    },
    execExpenses () {
      return this.peopleStore.execExpensesByIdentifier(this.$route.params.id)
    },
    mpExpenses () {
      return this.peopleStore.mpExpensesByIdentifier(this.$route.params.id)
    },
    returns () {
      return this.peopleStore.returnsByIdentifier(this.$route.params.id)
    },
    returnsRows () {
      var rows = []
      this.returns.forEach((thisReturn) => {
        rows.push([
          thisReturn.election.name,
          thisReturn.electorate.name,
          this.formatCurrency(thisReturn.donations_amount),
          this.formatCurrency(thisReturn.expenses_amount)
        ])
      })
      return rows
    },
    execExpensesRows () {
      var rows = []
      this.execExpenses.forEach((thisReturn) => {
        rows.push([
          thisReturn.report_date,
          this.formatCurrency(thisReturn.wellington_accommodation),
          this.formatCurrency(thisReturn.rest_of_nz_accommodation),
          this.formatCurrency(thisReturn.nz_air_travel),
          this.formatCurrency(thisReturn.nz_surface_travel),
          this.formatCurrency(thisReturn.domestic_total),
          this.formatCurrency(thisReturn.international)
        ])
      })
      return rows
    },
    mpExpensesRows () {
      var rows = []
      this.mpExpenses.forEach((thisReturn) => {
        if ((thisReturn.subtotal) || (thisReturn.interparl)) {
          rows.push([
            thisReturn.report_date,
            this.formatCurrency(thisReturn.wellington_accommodation),
            this.formatCurrency(thisReturn.rest_of_nz_accommodation),
            this.formatCurrency(thisReturn.air_travel),
            this.formatCurrency(thisReturn.surface_travel),
            this.formatCurrency(thisReturn.vip_transport),
            this.formatCurrency(thisReturn.subtotal),
            this.formatCurrency(thisReturn.interparl)
          ])
        }
      })
      return rows
    }
  }
}
</script>

<style scoped>

</style>
