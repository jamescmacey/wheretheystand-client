<template>
  <div id="electorate-view" v-if="electorate">
    <page-header class="mb-3" :pageTitle="electorate.name" :pageSubtitle="electorate.description"></page-header>
    <div class="container">
      <div v-if="(electorate.status === 'current' || electorate.status === 'retiring') && electorate.incumbent">
        <div class="row">
          <div class="col-12 col-md-4">
            <h4>Incumbent Member of Parliament</h4>
            <person-card :person="electorate.incumbent"></person-card>
          </div>
        </div>
      </div>
      <div v-if="electorate.status !== 'current'">
        <div class="row">
          <div class="col-12">
            <Card v-if="electorate.status === 'retiring'">
              <h5>This electorate is retiring<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to) }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} will be replaced by <router-link :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</router-link>.</p>
            </Card>
            <Card v-if="electorate.status === 'former'">
              <h5>This electorate retired<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to) }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} has been replaced by <router-link :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</router-link>.</p>
            </Card>
          </div>
        </div>
      </div>
      <div v-if="electorate.replaced_electorate">
        <div class="row">
          <div class="col-12">
            <h4>History</h4>
            <Card>
              <h5>This electorate replaced the {{ electorate.replaced_electorate.name }} electorate on {{ formatDate(electorate.valid_from )}}.</h5>
              <p>To see the former Members of Parliament</p>
            </Card>
          </div>
        </div>
      </div>
      <div id="electorate-map"></div>
    </div>
  </div>
</template>

<script>
import Card from '../components/Card.vue'
import PageHeader from '../components/PageHeader.vue'
import PersonCard from '../components/PersonCard.vue'
import mapkit from 'apple-mapkit-js'
var moment = require('moment')

export default {
  name: 'Bill',
  components: {
    PageHeader,
    Card,
    PersonCard
  },
  created () {
    this.$store.dispatch('fetchElectorate', { identifier: this.$route.params.id })
  },
  computed: {
    electorate () {
      return this.$store.getters.electorateByIdentifier(this.$route.params.id)
    }
  },
  methods: {
    formatDate (date) {
      return moment(date, 'YYYY-MM-DD').format('D MMMM YYYY')
    }
  },
  watch: {
    $route (to, from) {
      this.$store.dispatch('fetchElectorate', { identifier: to.params.id })
    }
  },
  mounted () {
    mapkit.init({
      authorizationCallback: function (done) {
        fetch('https://wheretheystand.nz/services/mapkit-jwt/')
          .then(response => done(response))
      }
    })

    var map = new mapkit.Map('electorate-map', {
      isRotationEnabled: false,
      isZoomEnabled: true,
      showsZoomControl: true
    })

    mapkit.importGeoJSON('https://storage.googleapis.com/wheretheystand-nz/electorates/general-electorates.json', {
      itemForMultiPolygon: function (collection, geoJSON) {
        var overlays = collection.getFlattenedItemList()
        var points = overlays.reduce(function (points, overlay) {
          return points.concat(overlay.points)
        }, [])
        return new mapkit.PolygonOverlay(points)
      },
      itemForFeature: function (overlay, geoJSON) {
        overlay.data = {
          name: geoJSON.properties.name,
          link: geoJSON.properties.wts_path
        }
        overlay.style = new mapkit.Style({
          fillOpacity: 0.7,
          lineWidth: 0.5
        })
        return overlay
      },
      geoJSONDidComplete: function (overlays) {
        map.addOverlays(overlays)
      }
    })
  }
}
</script>

<style scoped>

</style>
