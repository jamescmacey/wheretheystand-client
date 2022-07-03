<template>
  <div class="container-fluid hero" :style="{ backgroundImage: gradient }">
  <div class="container">
    <div v-if="!image">
      <h1 class="hero">{{ pageTitle }}</h1>
      <h3 class="hero" v-if="pageSubtitle">{{ pageSubtitle }}</h3>
    </div>
    <div v-else>
      <div class="d-flex align-items-center">
        <div class="flex-shrink-0">
          <img class="me-3" :src="image" :alt="pageTitle">
        </div>
        <div class="flex-grow-1 ms-3">
          <h1 class="hero">{{ pageTitle }}</h1>
          <h3 class="hero" v-if="pageSubtitle">{{ pageSubtitle }}</h3>
        </div>
      </div>
    </div>
    <nav v-if="pageLinks.length" class="navbar navbar-expand-lg navbar-light sub-nav">
      <ul class="navbar-nav">
        <li class="nav-item" v-for="(link, index) in pageLinks" :key="index">
          <NuxtLink class="nav-link" :to="link.to" active-class="active">{{ link.name }}</NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</div>
</template>

<script>
import { Harmonizer } from 'color-harmony'

export default {
  name: 'PageHeader',
  props: {
    pageTitle: String,
    pageSubtitle: String,
    image: String,
    colour: String,
    secondaryColour: String,
    pageLinks: {
      type: Array,
      default: () => { return [] }
    }
  },
  computed: {
    harmony: function () {
      var harmonizer = new Harmonizer()

      if (!this.colour) {
        return ['#58787f', 'rgb(52, 148, 148)']
      }

      if (this.secondaryColour) {
        return [this.colour, this.secondaryColour]
      }

      return harmonizer.harmonize(this.colour, 'neutral')
    },
    gradient: function () {
      return `linear-gradient(230deg, ${this.harmony[1]} 0%, ${this.harmony[0]} 50%)`
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 0px 0px 10px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
img {
  border-radius: 50%;
  max-width: 128px;
  margin-bottom: 10px;
}
</style>
