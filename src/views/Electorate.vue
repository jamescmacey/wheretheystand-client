<template>
  <div id="electorate-view" v-if="electorate">
    <page-header class="mb-3" :pageTitle="electorate.name" :pageSubtitle="electorate.description"></page-header>
    <div class="container">
      <div v-if="(electorate.status === 'current' || electorate.status === 'retiring') && electorate.incumbent">
        <div class="row">
          <div class="col-12 col-md-4">
            <h4>Incumbent Member of Parliament</h4>
            <person-card :person="electorate.incumbent"></person-card>
          </div>
        </div>
      </div>
      <div v-if="electorate.status !== 'current'">
        <div class="row">
          <div class="col-12">
            <Card v-if="electorate.status === 'retiring'">
              <h5>This electorate is retiring<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to) }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} will be replaced by <router-link :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</router-link>.</p>
            </Card>
            <Card v-if="electorate.status === 'former'">
              <h5>This electorate retired<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to) }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} has been replaced by <router-link :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</router-link>.</p>
            </Card>
          </div>
        </div>
      </div>
      <div v-if="electorate.replaced_electorate">
        <div class="row">
          <div class="col-12">
            <h4>History</h4>
            <Card>
              <h5>This electorate replaced the <router-link :to="'/electorates/' + electorate.replaced_electorate.slug">{{ electorate.replaced_electorate.name }}</router-link> electorate on {{ formatDate(electorate.valid_from )}}.</h5>
              <p>See <router-link :to="'/electorates/' + electorate.replaced_electorate.slug">{{ electorate.replaced_electorate.name }}</router-link> for more former MPs.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '../components/Card.vue'
import PageHeader from '../components/PageHeader.vue'
import PersonCard from '../components/PersonCard.vue'
var moment = require('moment')

export default {
  name: 'Bill',
  components: {
    PageHeader,
    Card,
    PersonCard
  },
  created () {
    this.$store.dispatch('fetchElectorate', { identifier: this.$route.params.id })
    this.$store.dispatch('fetchElectorateHistory', { identifier: this.$route.params.id })
  },
  computed: {
    electorate () {
      return this.$store.getters.electorateByIdentifier(this.$route.params.id)
    },
    affiliations () {
      return this.$store.getters.electorateHistoryByIdentifer(this.$route.params.id)
    }
  },
  methods: {
    formatDate (date) {
      return moment(date, 'YYYY-MM-DD').format('D MMMM YYYY')
    }
  },
  watch: {
    $route (to, from) {
      this.$store.dispatch('fetchElectorate', { identifier: to.params.id })
      this.$store.dispatch('fetchElectorateHistory', { identifier: this.$route.params.id })
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
