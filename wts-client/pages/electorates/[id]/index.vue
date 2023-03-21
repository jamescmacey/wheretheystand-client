<template>
  <div id="electorate-view" v-if="electorate">
    <Head>
    <Meta name="twitter:title" :content="electorate.name + '- WhereTheyStand'" />
    <Meta name="twitter:description" :content="electorate.description" />
    <Meta name="description" :content="electorate.description" />
    <Meta property="og:title" :content="electorate.name + '- WhereTheyStand'" />
    <Meta property="og:description" :content="electorate.description" />

    </Head>
    <PageHeader :pageTitle="electorate.name" :pageSubtitle="electorate.description"></PageHeader>
    <div class="container-fluid hero pt-0">
      <mapbox-map v-if="shape && shape['wts-comment'] != 'noshape'"
        accessToken="pk.eyJ1IjoiamFtZXNjbWFjZXkiLCJhIjoiY2xiN2VhYzVqMGE5YTN2bnhuM3l6d3pxbyJ9.CN_c4Tf7wXMtxyLKWrtvJg"
        height="500px" mapStyle="mapbox://styles/jamescmacey/clef24lj5000b01mlaqsjy2dl"
        :customAttribution="['Representation Commission', 'Stats NZ', 'Electoral Commission']" :center="center" :zoom="9"
        :autoResize="true">
        <mapbox-geogeometry-polygon v-for="(path, i) in paths" :key="i" :path="path" :opacity="0.2" /></mapbox-map>
    </div>
    <div class="mt-3 container">
      <div v-if="(electorate.status === 'current' || electorate.status === 'retiring') && electorate.incumbent">
        <div class="row">
          <div class="col-12 col-xl-4">
            <h4>Incumbent Member of Parliament</h4>
            <PersonCard :person="electorate.incumbent"></PersonCard>
          </div>
        </div>
      </div>
      <div v-if="electorate.status !== 'current'">
        <div class="row">
          <div class="col-12">
            <Card v-if="electorate.status === 'retiring'">
              <h5>This electorate is retiring<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to)
              }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} will be replaced by <NuxtLink
                  :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</NuxtLink>.</p>
            </Card>
            <Card v-if="electorate.status === 'former'">
              <h5>This electorate retired<span v-if="electorate.valid_to"> on {{ formatDate(electorate.valid_to)
              }}</span>.</h5>
              <p v-if="electorate.replaced_by">The electorate of {{ electorate.name }} has been replaced by <NuxtLink
                  :to="'/electorates/' + electorate.replaced_by.slug">{{ electorate.replaced_by.name }}</NuxtLink>.</p>
            </Card>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <h4>Previous MPs</h4>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" v-model="showReasons" id="showReasons">
            <label class="form-check-label" for="showReasons">
              Show reasons for commencement and conclusion of terms
            </label>
          </div>
        </div>
        <div class="col-12">
          <Card>
            <div v-for="(affiliation, i) in affiliations" :key="affiliation.id">
              <NuxtLink class="NuxtLink" :to="'/people/' + affiliation.person.slug">
                <div v-if="(i == 0) || (affiliations[i].person.id != affiliations[i - 1].person.id)">
                  <div v-if="affiliation.person.image" class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <img v-if="affiliation.person.image" :src="affiliation.person.image" class="me-3 person-image"
                        :alt="affiliation.person.display_name">
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <h5><strong>{{ affiliation.person.display_name }}</strong></h5>
                      <p class="text-muted">
                        <colour-dot v-if="affiliation.person.colour" :colour="affiliation.person.colour"></colour-dot>
                        Currently: {{ affiliation.person.description }}
                      </p>
                    </div>
                  </div>
                  <div v-else>
                    <h6><strong>{{ affiliation.person.display_name }}</strong></h6>
                    <p class="text-muted person-description">
                      <ColourDot v-if="affiliation.person.colour" :colour="affiliation.person.colour"></ColourDot>
                      Currently: {{ affiliation.person.description }}
                    </p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-1"></div>
                  <div class="col-11">
                    <div class="row">
                      <div class="col-12 col-md-6">
                        <h6 class="affiliation-date-heading">Started:</h6>
                        {{ formatDate(affiliation.start_date) }}
                        <h6 v-if="showReasons && affiliation.start_reason_desc" class="affiliation-date-heading">Reason:
                        </h6>
                        <span v-if="showReasons && affiliation.start_reason_desc">{{ affiliation.start_reason_desc
                        }}</span>
                      </div>
                      <div class="col-12 col-md-6" v-if="affiliation.end_date">
                        <h6 class="affiliation-date-heading">Ended:</h6>
                        {{ formatDate(affiliation.end_date) }}
                        <h6 v-if="showReasons && affiliation.end_reason_desc" class="affiliation-date-heading">Reason:
                        </h6>
                        <span v-if="showReasons && affiliation.end_reason_desc">{{ affiliation.end_reason_desc }}</span>
                      </div>
                    </div>
                    <hr
                      v-if="(i < (affiliations.length - 1)) && (affiliations[i].person.id == affiliations[i + 1].person.id)">
                  </div>
                </div>

                <hr
                  v-if="(i < (affiliations.length - 1)) && (affiliations[i].person.id != affiliations[i + 1].person.id)">
              </NuxtLink>
            </div>
            <hr>
            <p class="text-muted">These dates correspond to when an MP was eligible to sit and vote in the House of
              Representatives, not when they were declared elected. This list only includes MPs with profiles on
              WhereTheyStand, so it may contain some gaps.</p>
          </Card>
        </div>
      </div>
      <div v-if="electorate.replaced_electorate">
        <div class="row">
          <div class="col-12">
            <h4>History</h4>
            <Card>
              <h5>This electorate replaced the <NuxtLink :to="'/electorates/' + electorate.replaced_electorate.slug">{{
                electorate.replaced_electorate.name
              }}</NuxtLink> electorate on {{ formatDate(electorate.valid_from
)
}}.</h5>
              <p>See <NuxtLink :to="'/electorates/' + electorate.replaced_electorate.slug">{{
                electorate.replaced_electorate.name
              }}</NuxtLink> for more former MPs.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, parse } from 'date-fns'
import { useElectoratesStore } from '../../../stores/electorates'

export default {
  name: 'Electorate',
  setup() {
    const electoratesStore = useElectoratesStore()

    return { electoratesStore }
  },
  data() {
    return {
      showReasons: false
    }
  },
  created() {
    this.electoratesStore.fetch(this.$route.params.id)
    this.electoratesStore.fetchHistory(this.$route.params.id)
    this.electoratesStore.fetchShape(this.$route.params.id)
  },
  computed: {
    electorate() {
      return this.electoratesStore.byIdentifier(this.$route.params.id)
    },
    affiliations() {
      return this.electoratesStore.historyByIdentifier(this.$route.params.id)
    },
    shape() {
      return this.electoratesStore.shapeByIdentifier(this.$route.params.id)
    },
    paths() {
      if (!this.shape || this.shape['wts-comment'] == 'noshape') {
        return []
      }
      var feature = this.shape.features[0]
      if (feature.geometry.type == 'Polygon') {
        return this.shape.features[0].geometry.coordinates
      } else if (feature.geometry.type == 'MultiPolygon') {
        var paths = []
        this.shape.features[0].geometry.coordinates.forEach(polygon => {
          paths.push(polygon[0])
        })
        return paths
      }
    },
    limits() {
      if (!this.shape || this.shape['wts-comment'] == 'noshape') {
        return undefined
      }
      var north = -180
      var south = 0
      var east = 0
      var west = 360

      this.paths.forEach(polygon => {
        polygon.forEach(coordinate => {
          var ewc = coordinate[0]
          var nsc = coordinate[1]

          // Chathams making my life harder xoxo
          if (ewc < 0) {
            ewc = ewc + 360
          }

          if (ewc > east) {
            east = ewc
          }
          if (ewc < west) {
            west = ewc
          }
          if (nsc > north) {
            north = nsc
          }
          if (nsc < south) {
            south = nsc
          }
        })
      })

      if (east > 180) {
        east = east - 360
      }

      return {
        north: north,
        south: south,
        east: east,
        west: west
      }
    },
    center() {
      if (this.limits) {
        // Do the east-west calc separately... 
        // Chathams are on the wrong side of the antimeridian :(
        var east = this.limits.east
        if (east < 0) {
          east = east + 360
        }

        var ewCentre = ((east + this.limits.west) / 2)

        if (ewCentre > 180) {
          ewCentre = ewCentre - 360
        }

        return [ewCentre, ((this.limits.north + this.limits.south) / 2)]
      } else {
        return [0, 0]
      }
    }
  },
  methods: {
    formatDate(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
    }
  },
  watch: {
    $route(to, from) {
      if (to.fullPath.startsWith("/electorates/")) {
        this.electoratesStore.fetch(to.params.id)
        this.electoratesStore.fetchHistory(to.params.id)
        this.electoratesStore.fetchShape(to.params.id)
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.affiliation-date-heading {
  margin-bottom: 0px
}

p.person-description {
  padding-bottom: 0px;
  margin-bottom: 0px;
}

.NuxtLink,
.NuxtLink:hover {
  color: black;
  text-decoration: none;
}
</style>
