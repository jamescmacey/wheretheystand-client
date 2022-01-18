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
      <div class="row">
        <div class="col-12">
          <h4>Previous MPs</h4>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" v-model="showReasons" id="showReasons">
            <label class="form-check-label" for="showReasons">
              Show reasons for commencement and conclusion of terms
            </label>
          </div>
        </div>
        <div class="col-12">
          <Card>
            <div v-for="(affiliation, i) in affiliations" :key="affiliation.id">
              <router-link class="router-link" :to="'/people/' + affiliation.person.slug">
                <div v-if="(i == 0) || (affiliations[i].person.id != affiliations[i-1].person.id)">
                  <div v-if="affiliation.person.image" class="media m-2">
                    <img v-if="affiliation.person.image" :src="affiliation.person.image" class="mr-3 person-image" :alt="affiliation.person.display_name">
                    <div class="media-body">
                        <h6><strong>{{ affiliation.person.display_name }}</strong></h6>
                        <p class="text-muted person-description"><colour-dot v-if="affiliation.person.colour" :colour="affiliation.person.colour"></colour-dot>Currently: {{ affiliation.person.description }}</p>
                    </div>
                  </div>
                  <div v-else>
                    <h6><strong>{{ affiliation.person.display_name }}</strong></h6>
                    <p class="text-muted person-description"><colour-dot v-if="affiliation.person.colour" :colour="affiliation.person.colour"></colour-dot>Currently: {{ affiliation.person.description }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-1"></div>
                  <div class="col-11">
                    <div class="row">
                      <div class="col-12 col-md-6">
                        <h6 class="affiliation-date-heading">Started:</h6>
                        {{ formatDate(affiliation.start_date) }}
                        <h6 v-if="showReasons && affiliation.start_reason_desc" class="affiliation-date-heading">Reason:</h6>
                        <span v-if="showReasons && affiliation.start_reason_desc">{{ affiliation.start_reason_desc }}</span>
                      </div>
                      <div class="col-12 col-md-6" v-if="affiliation.end_date">
                        <h6 class="affiliation-date-heading">Ended:</h6>
                        {{ formatDate(affiliation.end_date) }}
                        <h6 v-if="showReasons && affiliation.end_reason_desc" class="affiliation-date-heading">Reason:</h6>
                        <span v-if="showReasons && affiliation.end_reason_desc">{{ affiliation.end_reason_desc }}</span>
                      </div>
                    </div>
                    <hr v-if="(i < (affiliations.length - 1)) && (affiliations[i].person.id == affiliations[i+1].person.id)">
                  </div>
                </div>

                <hr v-if="(i < (affiliations.length - 1)) && (affiliations[i].person.id != affiliations[i+1].person.id)">
              </router-link>
            </div>
            <hr>
            <p class="text-muted">These dates correspond to when an MP was eligible to sit and vote in the House of Representatives, not when they were declared elected. This list only includes MPs with profiles on WhereTheyStand, so it may contain some gaps.</p>
          </Card>
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
import ColourDot from '../components/ColourDot.vue'
var moment = require('moment')

export default {
  name: 'Bill',
  components: {
    PageHeader,
    Card,
    PersonCard,
    ColourDot
  },
  data () {
    return {
      showReasons: false
    }
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
      return this.$store.getters.electorateHistoryByIdentifier(this.$route.params.id)
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
.affiliation-date-heading {
  margin-bottom: 0px
}

p.person-description {
  padding-bottom: 0px;
  margin-bottom: 0px;
}

.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
