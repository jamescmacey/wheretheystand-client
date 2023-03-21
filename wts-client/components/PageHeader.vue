<template>
  <div>
    <Head>
      <Title>{{ metaTitle }}</Title>
    </Head>
    <div class="container-fluid hero" :style="{ backgroundImage: gradient }">
      <div class="container">
        <div v-if="!image">
          <h1 class="hero">{{ pageTitle }}</h1>
          <h3 class="hero" v-if="pageSubtitle">{{ pageSubtitle }}</h3>
          <h5 class="hero text-uppercase" v-if="pageDate">{{ formatDate(pageDate) }}</h5>
        </div>
        <div v-else>
          <div class="d-flex align-items-center">
            <div class="flex-shrink-0">
              <img class="me-3" :src="image" :alt="pageTitle">
            </div>
            <div class="flex-grow-1 ms-3">
              <h1 class="hero">{{ pageTitle }}</h1>
              <h3 class="hero" v-if="pageSubtitle">{{ pageSubtitle }}</h3>
              <h5 class="hero text-uppercase" v-if="pageDate">{{ formatDate(pageDate) }}</h5>
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
    <div v-if="backLink" class="container-fluid" :style="{backgroundColor: harmony[1]}">
      <div class="container py-2">
        <RouterLink :to="backLink">
          <FontAwesomeIcon :icon="['fas','arrow-left']"></FontAwesomeIcon> {{ backText }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import { Harmonizer } from 'color-harmony'
import { format, parse } from 'date-fns'

export default {
  name: 'PageHeader',
  props: {
    pageTitle: String,
    pageSubtitle: String,
    pageDate: String,
    image: String,
    colour: String,
    secondaryColour: String,
    metaPageTitle: {
      type: String,
      default: null
    },
    pageLinks: {
      type: Array,
      default: () => { return [] }
    },
    backLink: {
      type: String,
      default: null,
    },
    backText: {
      type: String,
      default: "Go back"
    }
  },
  computed: {
    metaTitle() {
      if (this.metaPageTitle) {
        return this.metaPageTitle
      } else if (this.pageTitle) {
        return this.pageTitle
      } else {
        return ""
      }
    },
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
    },
  },
  methods: {
    formatDate(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
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
  color: white;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  border-radius: 50%;
  max-width: 128px;
  margin-bottom: 10px;
}</style>
