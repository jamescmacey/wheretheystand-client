<template>
  <Card>
      <h5>{{ record.bill.name }}</h5>
      <div class="row">
          <div class="col-4 text-center" v-for="(vote, reading) in record.votes" :key="reading">
            <div v-if="vote.position">
              <span class="vote-info">{{ readingName(reading) }}</span>
              <br>
              <font-awesome-icon title="Supported" class="position-icon yes" v-if="vote.position === 'y'" :icon="['fas', 'check']"></font-awesome-icon>
              <font-awesome-icon title="Opposed" class="position-icon no" v-else-if="vote.position === 'n'" :icon="['fas', 'times']"></font-awesome-icon>
              <font-awesome-icon title="Abstained" class="position-icon abstain" v-else-if="vote.position === 'a'" :icon="['fas', 'map-signs']"></font-awesome-icon>
              <font-awesome-icon title="Absent" class="position-icon absent" v-else-if="vote.position === 'x'" :icon="['fas', 'question']"></font-awesome-icon>
              <br>
              <span class="vote-info text-muted">{{ dateFormat(vote.date) }}</span>
            </div>
          </div>
      </div>
  </Card>
</template>

<script>
import Card from './Card.vue'
var moment = require('moment')
export default {
  name: 'PersonPersonalVote',
  components: {
    Card
  },
  props: {
    record: Object
  },
  methods: {
    dateFormat (date) {
      return moment(date, 'YYYY-MM-DD').format('D.M.YYYY')
    },
    readingName (reading) {
      return {
        1: '1st reading',
        2: '2nd reading',
        3: '3rd reading'
      }[reading]
    }
  },
  computed: {
    relativeDate () {
      return moment(this.bill.date_modified, 'YYYY-MM-DD').fromNow()
    }
  }
}
</script>

<style scoped>
.position-icon {
  font-size: 2em;
}

.yes {
  color: green;
}

.no {
  color: red;
}

.abstain {
  color: blue;
}

.vote-info {
  font-size: 0.8em
}
</style>
