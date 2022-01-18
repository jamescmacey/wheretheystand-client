<template>
  <div id="people">
    <page-header pageTitle="People" class="mb-3" pageSubtitle="Current and Former Members of Parliament"></page-header>
    <div class="container">
      <div class="row">
        <select class="form-select col-12 mb-3" aria-label="Filter list of people" v-model="filterName">
            <option selected value="incumbent">Current MPs</option>
            <option value="all">All people</option>
            <option value="former">Former MPs</option>
          </select>
      </div>
      <div class="row">
        <h4 class="col-12">All MPs</h4>
        <div class="col-12">
          <Card>
            <div v-for="(person, i) in people" :key="person.id">
              <router-link class="router-link" :to="'/people/' + person.slug">
              <div v-if="person.image" class="media m-2">
                <img v-if="person.image" :src="person.image" class="mr-3 person-image" :alt="person.display_name">
                <div class="media-body">
                    <h6><strong>{{ person.display_name }}</strong></h6>
                    <p class="text-muted person-description"><colour-dot v-if="person.colour" :colour="person.colour"></colour-dot>{{ person.description }}</p>
                </div>
              </div>
              <div v-else>
                <h6><strong>{{ person.display_name }}</strong></h6>
                <p v-if="person.description" class="text-muted person-description"><colour-dot v-if="person.colour" :colour="person.colour"></colour-dot>{{ person.description }}</p>
              </div>
              </router-link>
              <hr v-if="i < (people.length - 1)">
            </div>
          </Card>
        </div>
      </div>
      <div class="row">
        <h4 class="col-12">Some statistics</h4>
        <div class="col-12 col-md-4">
          <card>
            <h5><span v-for="(person, i) in mostCommonNames" :key="i">{{ person }}<span v-if="i < (mostCommonNames.length - 2)">, </span><span v-else-if="i < (mostCommonNames.length - 1)"> and </span></span></h5> <span v-if="mostCommonNamed.length === 1">is</span><span v-else>are</span> the most common name<span v-if="mostCommonNamed.length !== 1">s</span> in Parliament, with {{ mostCommonNameCount }} MPs<span v-if="mostCommonNames.length > 1"> each</span>: <span v-for="(person, i) in mostCommonNamed" :key="i"><inline-person-text :entity="person" class="mr-2 mb-1"></inline-person-text></span>
          </card>
        </div>
        <div class="col-12 col-md-4">
          <card>
            <h5>xx%</h5> of MPs are men.
          </card>
        </div>
        <div class="col-12 col-md-4">
          <card></card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '../components/Card.vue'
import PageHeader from '../components/PageHeader.vue'
import ColourDot from '../components/ColourDot.vue'
import InlinePersonText from '../components/InlinePersonText.vue'

export default {
  name: 'People',
  components: { PageHeader, Card, ColourDot, InlinePersonText },
  data () {
    return {
      filterName: 'incumbent'
    }
  },
  created () {
    this.$store.dispatch('fetchPeopleGroup', { groupName: 'allLive' })
  },
  computed: {
    filter () {
      switch (this.filterName) {
        case 'all':
          return ['current', 'provisional', 'former', 'generic']
        case 'incumbent':
          return ['current', 'provisional']
        case 'former':
          return ['former']
        default:
          return []
      }
    },
    people () {
      return (this.$store.getters.groupByName('allLive') || []).sort((a, b) => {
        if (a.last_name.toLowerCase() < b.last_name.toLowerCase()) {
          return -1
        }
        return 1
      }).filter(person => {
        if (this.filter.indexOf(person.membership_status) >= 0) {
          return true
        }
      })
    },
    mostCommonNamed () {
      var counts = {}
      var leader = ''
      var leaderCount = 0
      this.people.forEach(person => {
        if (counts[person.first_name] !== undefined) {
          counts[person.first_name] = counts[person.first_name] + 1
        } else {
          counts[person.first_name] = 1
        }

        if (counts[person.first_name] > leaderCount) {
          leader = person.first_name
          leaderCount++
        } else if (person.first_name === leader) {
          leaderCount++
        }
      })
      return this.people.filter(person => counts[person.first_name] === leaderCount)
    },
    mostCommonNames () {
      var names = []
      this.mostCommonNamed.forEach(person => {
        if (names.indexOf(person.first_name) < 0) {
          names.push(person.first_name)
        }
      })
      return names
    },
    mostCommonNameCount () {
      return this.people.filter(person => person.first_name === this.mostCommonNames[0]).length
    }
  }
}
</script>

<style scoped>
p.person-description {
  padding-bottom: 0px;
  margin-bottom: 0px;
}

.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
