<template>
  <router-link class="router-link" :to="'/bills/' + bill.id">
    <Card>
      <h5>{{ bill.name }}</h5>
      <p>{{ bill.description }}</p>
      <span v-if="bill.date_modified" :title="formattedDate" class="text-muted"><font-awesome-icon :icon="['fas', 'history']"></font-awesome-icon> Last activity {{ relativeDate }}</span>
    </Card>
  </router-link>
</template>

<script>
import Card from '../components/Card.vue'
var moment = require('moment')
export default {
  name: 'SmallBill',
  components: {
    Card
  },
  props: {
    bill: Object
  },
  computed: {
    relativeDate () {
      return moment(this.bill.date_modified, 'YYYY-MM-DD').fromNow()
    },
    formattedDate () {
      return moment(this.bill.date_modified, 'YYYY-MM-DD').format('D.M.YYYY')
    }
  }
}
</script>

<style scoped>
.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}
</style>
