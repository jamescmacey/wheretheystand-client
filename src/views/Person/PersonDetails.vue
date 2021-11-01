<template>
  <div class="container">
    <div class="row mt-3" v-if="details">
      <div class="col-12 col-md-6">
        <h4>Parliamentary history</h4>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" v-model="showReasons" id="showReasons">
          <label class="form-check-label" for="showReasons">
            Show reasons
          </label>
        </div>
        <card>
          <div v-for="(affiliation, i) in details.parliamentary_affiliations.slice(0, parliamentaryAffiliationCount)" :key="i">
            <h5 v-if="affiliation.electorate">MP for <router-link :to="'/electorates/' + affiliation.electorate.slug">{{ affiliation.electorate.name }}</router-link></h5>
            <h5 v-else-if="affiliation.fallback_electorate_slug">MP for <span class="text-uppercase text-muted">{{ affiliation.fallback_electorate_slug }}</span></h5>
            <h5 v-else>List MP</h5>
            <h6><router-link :to="'/parliaments/' + affiliation.parliament.number">{{ ordinal_suffix_of(affiliation.parliament.number) }} Parliament</router-link></h6>
            <div class="row">
              <div class="col-12 col-md-6">
                <strong>Started:</strong> {{ formatDate(affiliation.start_date) }}<br>
                <span v-if="affiliation.start_reason_desc && showReasons"><strong>Reason:</strong> {{ affiliation.start_reason_desc }}</span>
              </div>
              <div v-if="affiliation.end_date" class="col-12 col-md-6">
                <strong>Ended:</strong> {{ formatDate(affiliation.end_date) }}<br>
                <span v-if="affiliation.end_reason_desc && showReasons"><strong>Reason:</strong> {{ affiliation.end_reason_desc }}</span>
              </div>
            </div>
            <hr>
          </div>
          <p class="text-muted">These dates correspond to when an MP was eligible to sit and vote in the House of Representatives, not when they were declared elected.</p>
        </card>
        <div v-if="details.parliamentary_affiliations.length > parliamentaryAffiliationCount">
              <DisplayControlButton v-on:click="parliamentaryAffiliationCount = details.parliamentary_affiliations.length">
                  <font-awesome-icon :icon="['fas', 'chevron-down']"></font-awesome-icon> Show all Parliamentary affiliations
              </DisplayControlButton>
          </div>
          <div v-else-if="(parliamentaryAffiliationCount === details.parliamentary_affiliations.length) && (parliamentaryAffiliationCount > 1)">
            <DisplayControlButton v-on:click="parliamentaryAffiliationCount = 1">
                  <font-awesome-icon :icon="['fas', 'chevron-up']"></font-awesome-icon> Show fewer Parliamentary affiliations
              </DisplayControlButton>
          </div>
      </div>
      <div class="col-12 col-md-6">
        <h4>Party history</h4>
        <card>
          <div v-for="(affiliation, i) in details.party_affiliations" :key="i">
            <h5><colour-dot v-if="affiliation.party.colour" :colour="affiliation.party.colour"></colour-dot><router-link :to="'/parties/' + affiliation.party.slug">{{ affiliation.party.display_name }}</router-link></h5>
            <div class="row">
              <div class="col-12 col-md-6">
                <strong>Started:</strong> {{ formatDate(affiliation.start_date) }}<br>
              </div>
              <div v-if="affiliation.end_date" class="col-12 col-md-6">
                <strong>Ended:</strong> {{ formatDate(affiliation.end_date) }}<br>
              </div>
            </div>
            <hr v-if="i !== (details.party_affiliations.length - 1)">
          </div>
        </card>
      </div>
    </div>
    <div class="row" v-if="details">
      <div class="col-12 col-md-6" v-if="details.twitter_user">
        <h4>Contacts and social media</h4>
      </div>
    </div>
    <div class="row" v-if="details">
      <div class="col-12 col-md-6" v-if="details.twitter_user">
        <twitter-user-card :user="details.twitter_user"></twitter-user-card>
      </div>
      <div class="col-12 col-md-6">
        <Card>
          <h5>Bio</h5>
          <div v-if="details.bio.email_address">
            <h6>Email address</h6>
            <span class="text-lowercase">{{ details.bio.email_address }}</span>
            <hr>
          </div>
          <div v-if="details.bio.birth_date">
            <h6>Date of Birth</h6>
            <span>{{ formatDate(details.bio.birth_date) }}</span>
            <hr>
          </div>
          <div v-if="details.bio.birth_date && !details.bio.death_date">
            <h6>Age</h6>
            <span>{{ currentAge }}</span>
            <hr>
          </div>
          <div v-if="details.bio.death_date">
            <h6>Passed away</h6>
            <span>{{ formatDate(details.bio.death_date) }}</span>
            <hr>
          </div>
          <div v-if="details.bio.death_date && details.bio.birth_date">
            <h6>Age at death</h6>
            <span>{{ ageAtDeath }}</span>
            <hr>
          </div>
          <div v-if="details.bio.wikidata_id">
            <h6>Wikidata ID</h6>
            <span>{{ details.bio.wikidata_id }}</span>
            <hr>
          </div>
          <div v-if="details.bio.turnbull_id">
            <h6>Alexander Turnbull Library ID</h6>
            <span>{{ details.bio.turnbull_id }}</span>
            <hr>
          </div>
          <div v-if="details.bio.snapchat_user">
            <h6>Snapchat</h6>
            <span><social-media-link :username="details.bio.snapchat_user" platform="snapchat"></social-media-link></span>
            <hr>
          </div>
          <div v-if="details.bio.instagram_user">
            <h6>Instagram</h6>
            <span><social-media-link :username="details.bio.instagram_user" platform="instagram"></social-media-link></span>
            <hr>
          </div>
          <div v-if="details.bio.facebook_page">
            <h6>Facebook</h6>
            <span><social-media-link :username="details.bio.facebook_page" platform="facebook"></social-media-link></span>
            <hr>
          </div>
          <div v-if="details.bio.wikipedia_page">
            <h6>Wikipedia</h6>
            <span><social-media-link :username="details.bio.wikipedia_page" platform="wikipedia"></social-media-link></span>
            <hr>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '../../components/Card.vue'
import TwitterUserCard from '../../components/TwitterUserCard.vue'
import DisplayControlButton from '../../components/DisplayControlButton.vue'
import SocialMediaLink from '../../components/SocialMediaLink.vue'
import ColourDot from '../../components/ColourDot.vue'
var moment = require('moment')
export default {
  name: 'PersonDetails',
  components: {
    TwitterUserCard,
    Card,
    DisplayControlButton,
    SocialMediaLink,
    ColourDot
  },
  data () {
    return {
      showReasons: false,
      parliamentaryAffiliationCount: 1
    }
  },
  created () {
    this.$store.dispatch('fetchPersonDetails', { identifier: this.$route.params.id })
  },
  mounted () {
  },
  methods: {
    formatDate (date) {
      return moment(date, 'YYYY-MM-DD').format('D.M.YYYY')
    },
    ordinal_suffix_of (i) {
      var j = i % 10
      var k = i % 100
      if (j === 1 && k !== 11) {
        return i + 'st'
      }
      if (j === 2 && k !== 12) {
        return i + 'nd'
      }
      if (j === 3 && k !== 13) {
        return i + 'rd'
      }
      return i + 'th'
    }
  },
  computed: {
    details () {
      return this.$store.getters.personDetailsByIdentifier(this.$route.params.id)
    },
    currentAge () {
      return moment().diff(this.details.bio.birth_date, 'years') + ' years'
    },
    ageAtDeath () {
      return moment(this.details.bio.death_date, 'YYYY-MM-DD').diff(this.details.bio.birth_date, 'years') + ' years'
    }
  }
}
</script>

<style scoped>

</style>
