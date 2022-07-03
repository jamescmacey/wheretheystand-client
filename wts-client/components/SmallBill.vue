<template>
  <NuxtLink class="router-link" :to="'/bills/' + bill.id">
    <Card>
      <h5>{{ bill.name }}</h5>
      <p>{{ bill.description }}</p>
      <span v-if="bill.date_modified" :title="formattedDate" class="text-muted"><font-awesome-icon :icon="['fas', 'history']"></font-awesome-icon> Last activity {{ relativeDate }}</span>
    </Card>
  </NuxtLink>
</template>

<script>
import Card from '../components/Card.vue'
import { parse, format, formatDistanceToNow } from 'date-fns'

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
      return formatDistanceToNow(parse(this.bill.date_modified, 'yyyy-MM-dd', new Date())) + " ago"
    },
    formattedDate () {
      return format(parse(this.bill.date_modified, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
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
