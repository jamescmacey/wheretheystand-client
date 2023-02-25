<template>
  <div id="people">
    <PageHeader pageTitle="People" class="mb-3" pageSubtitle="Current and Former Members of Parliament"></PageHeader>
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
            <PersonList :people="people">
            </PersonList>
          </Card>
        </div>
      </div>
      <div class="row">
        <h4 class="col-12">Some statistics</h4>
        <div class="col-12 col-md-4">
          <Card>
            <h5><span v-for="(person, i) in mostCommonNames" :key="i">{{ person }}<span
                  v-if="i < (mostCommonNames.length - 2)">, </span><span v-else-if="i < (mostCommonNames.length - 1)">
                  and </span></span></h5> <span v-if="mostCommonNamed.length === 1">is</span><span v-else>are</span> the
            most common name<span v-if="mostCommonNamed.length !== 1">s</span> in Parliament, with {{
                mostCommonNameCount
            }} MPs<span v-if="mostCommonNames.length > 1"> each</span>: <span
              v-for="(person, i) in mostCommonNamed" :key="i">
              <InlinePersonText :entity="person" class="me-2 mb-1"></InlinePersonText>
            </span>
          </Card>
        </div>
        <div class="col-12 col-md-4">
          <Card>
            <h5>xx%</h5> of MPs are men.
          </Card>
        </div>
        <div class="col-12 col-md-4">
          <Card></Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
p.person-description {
  margin-top: 5px;
  margin-bottom: 0px;
}
</style>

<script>
import { useGroupsStore } from '../../stores/groups'




export default {
  name: 'People',
  setup() {
    const groupsStore = useGroupsStore()
    return { groupsStore }
  },
  data() {
    return {
      filterName: 'incumbent'
    }
  },
  created() {
    this.groupsStore.fetchPeople("allLive")
  },
  computed: {
    filter() {
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
    people() {
      return (this.groupsStore.byName('allLive', 'people') || []).sort((a, b) => {
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
    mostCommonNamed() {
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
    mostCommonNames() {
      var names = []
      this.mostCommonNamed.forEach(person => {
        if (names.indexOf(person.first_name) < 0) {
          names.push(person.first_name)
        }
      })
      return names
    },
    mostCommonNameCount() {
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

.router-link,
.router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
