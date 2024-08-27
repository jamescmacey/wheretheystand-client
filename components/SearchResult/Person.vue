<template>
    <NuxtLink class="router-link" :to="person.absoluteURL">
        <Card>
      <div class="d-flex align-items-center">
        <div class="flex-shrink-0">
          <img :src="computedImgUrl" class="me-3 person-image" :alt="person.primaryName">
        </div>
        <div class="flex-grow-1 ms-2">
          <h5><strong>{{ person.primaryName }}</strong></h5>
          <p class="text-muted">
            {{ person.byline }}
          </p>
        </div>
      </div>
    </Card>
    </NuxtLink>
    
</template>

<script>
import { AisHighlight } from 'vue-instantsearch/vue3/es'

export default {
    name: 'SearchResultPerson',
    components: {
        AisHighlight
    },
    props: {
        person: Object
    },
    computed: {
        computedImgUrl() {
            if (this.person.imageURL && this.person.imageURL.startsWith('nzpm_app')) {
                return "https://storage.googleapis.com/wheretheystand-nz/" + this.person.imageURL
            } else {
                return "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/people-images/generic.png"
            }
        }
    }
}

</script>

<style scoped>
.router-link, .router-link:hover {
  color: black;
  text-decoration: none;
}

p {
  margin-top: 5px;
  margin-bottom: 0px;
}
</style>
