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
