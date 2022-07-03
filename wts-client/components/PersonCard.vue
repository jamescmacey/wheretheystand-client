<template>
  <router-link class="router-link" :to="'/people/' + person.slug">
    <Card>
      <div v-if="person.image" class="d-flex align-items-center">
        <div class="flex-shrink-0">
          <img v-if="person.image" :src="person.image" class="me-3 person-image" :alt="person.display_name">
        </div>
        <div class="flex-grow-1 ms-3">
          <h5><strong>{{ person.display_name }}</strong></h5>
          <p class="text-muted">
            <colour-dot v-if="person.colour" :colour="person.colour"></colour-dot>{{ person.description }}
          </p>
        </div>
      </div>
      <div v-else>
        <h5><strong>{{ person.display_name }}</strong></h5>
        <p v-if="person.description" class="text-muted">
          <colour-dot v-if="person.colour" :colour="person.colour"></colour-dot>{{ person.description }}
        </p>
      </div>
    </Card>
  </router-link>
</template>

<script>
import Card from './Card.vue'
import ColourDot from './ColourDot.vue'
export default {
  name: 'PersonCard',
  components: {
    Card,
    ColourDot
  },
  props: {
    person: Object
  }
}
</script>

<style scoped>
.router-link,
.router-link:hover {
  color: black;
  text-decoration: none;
}

p {
  margin-top: 5px;
  margin-bottom: 0px;
}
</style>
