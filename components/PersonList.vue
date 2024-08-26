<template>
    <div v-for="(person, i) in displayPeople" :key="person.id">
              <NuxtLink class="router-link" :to="'/people/' + person.slug">
                <div v-if="person.image" class="d-flex align-items-center">
                  <div class="flex-shrink-0">
                    <img v-if="person.image" :src="person.image" class="me-3 person-image" :alt="person.display_name">
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6><strong>{{ person.display_name }}</strong></h6>
                    <p class="text-muted person-description">
                      <ColourDot v-if="person.colour" :colour="person.colour"></ColourDot>{{ person.description }}
                    </p>
                  </div>
                </div>

                <div v-else>
                  <h6><strong>{{ person.display_name }}</strong></h6>
                  <p v-if="person.description" class="text-muted person-description">
                    <ColourDot v-if="person.colour" :colour="person.colour"></ColourDot>{{ person.description }}
                  </p>
                </div>
              </NuxtLink>
              <hr v-if="i < (displayPeople.length - 1)">
            </div>
</template>

<script>
export default {
    name: "PersonList",
    props: {
      people: {
        default: [],
        type: Array
      },
      positions: {
        default: [],
        type: Array
      }
    },
    computed: {
      displayPeople () {
        if (this.people.length > 0) {
          return this.people
        } else if (this.positions.length > 0) {
          var people = []
          this.positions.forEach(pos => {
            people.push(pos.person)
          })
          return people
        } else {
          return []
        }
      },
      showVoting () {
        if (this.people.length == 0 && this.positions.length > 0) {
          return true
        } else {
          return false
        }
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