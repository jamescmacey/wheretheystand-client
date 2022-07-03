<template>
  <Card>
      <NuxtLink class="router-link" :to="'/bills/' + record.bill.id">
      <h5>{{ record.bill.name }}</h5>
      <div class="row">
          <div class="col-4 text-center" v-for="(vote, reading) in record.votes" :key="reading">
            <div v-if="vote.position">
              <span class="vote-info">{{ readingName(reading) }}</span>
              <br>
              <FontAwesomeIcon title="Supported" class="position-icon yes" v-if="vote.position === 'y'" :icon="['fas', 'check']"></FontAwesomeIcon>
              <FontAwesomeIcon title="Opposed" class="position-icon no" v-else-if="vote.position === 'n'" :icon="['fas', 'times']"></FontAwesomeIcon>
              <FontAwesomeIcon title="Abstained" class="position-icon abstain" v-else-if="vote.position === 'a'" :icon="['fas', 'map-signs']"></FontAwesomeIcon>
              <FontAwesomeIcon title="Absent" class="position-icon absent" v-else-if="vote.position === 'x'" :icon="['fas', 'question']"></FontAwesomeIcon>
              <br>
              <span class="vote-info text-muted">{{ dateFormat(vote.date) }}</span>
            </div>
          </div>
      </div>
      </NuxtLink>
  </Card>
</template>

<script>
import Card from './Card.vue'
import { parse, format } from 'date-fns'

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
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
    },
    readingName (reading) {
      return {
        1: '1st reading',
        2: '2nd reading',
        3: '3rd reading'
      }[reading]
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

.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
