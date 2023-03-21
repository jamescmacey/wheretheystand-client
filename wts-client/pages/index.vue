<template>
  <div>
    <div id="cover-image" class="container-fluid text-start py-5">
      <div class="container">
        <div class="row">
          <div class="col-12 col-xl-8 py-xl-5 py-2">
            <h1 class="display-4">Wondering where they stand?</h1>
            <hr />
            <h3>
              WhereTheyStand aggregates voting data, financial information,
              biographical information, and more.
            </h3>
          </div>
          <div id="onboarding" class="col-12 col-xl-4 py-xl-5 py-2">
            <Card :frosted="true">
              <h4 class="mt-2">Find your MP, electorate or party</h4>
              All MPs who've been in Parliament since 2014 have profiles.
              <SearchBar class="mt-2"></SearchBar>
              <RandomResource></RandomResource>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-3">
      <div class="row">
        <div class="col-12 col-xl-4">
          <h4>Recent votes</h4>
          <Card>
            <div v-if="homepageData">
              <ul class="homepage-resource-list">
                <li v-for="(vote, i) in homepageData.votes" :key="vote.id" class="mb-3 vote-list">
                  <h6 class="mb-0">{{ vote.name }}</h6>
                  <small class="me-1">
                    <span v-if="vote.type_desc" class="badge bg-primary text-uppercase">{{ vote.type_desc }}</span>
                  </small>
                  <small class="text-muted text-uppercase">{{ formattedDateFull(vote.date) }}</small><br>
                  <div class="text-start">
                    <NuxtLink :to="'/votes/' + vote.id" class="vote-link mt-1">View vote <FontAwesomeIcon :icon="['fas','arrow-right']"></FontAwesomeIcon></NuxtLink>
                  </div>
                  <hr v-if="i < 4" class="mt-1">
                </li>
              </ul>
            </div>
          </Card>
        </div>
        <div class="col-12 col-xl-4">
          <h4>Recently updated bills</h4>
          <Card>
            <div v-if="homepageData">
              <ul class="homepage-resource-list">
                <li v-for="(bill, i) in homepageData.bills" :key="bill.id" class="mb-3 bill-list">
                  <h6 class="mb-0">{{ bill.name }}</h6>
                  <small class="me-1">
                    <span v-if="bill.progress == 'inp'" class="badge bg-primary text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'pas'" class="badge bg-success text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'ena'" class="badge bg-success text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'dis'" class="badge bg-warning text-dark text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'def'" class="badge bg-danger text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'lap'" class="badge bg-danger text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'unx'" class="badge bg-danger text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'div'" class="badge bg-info text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else-if="bill.progress == 'wit'" class="badge bg-warning text-dark text-uppercase"> {{ bill.progress_desc }}</span>
                    <span v-else class="badge bg-secondary text-uppercase"> {{ bill.progress_desc }}</span>
                </small>
                <small class="text-muted text-uppercase">{{ bill.type_desc }}</small>
                  <div class="text-start">
                    <NuxtLink :to="'/bills/' + bill.id" class="bill-link mt-1">View bill <FontAwesomeIcon :icon="['fas','arrow-right']"></FontAwesomeIcon></NuxtLink>
                  </div>
                  <hr v-if="i < 4" class="mt-1">
                </li>
              </ul>
            </div>
          </Card>
        </div>
        <div class="col-12 col-xl-4">
          <h4>Elections</h4>
          <Card>
            <div class="election">
              <h5>2022 Hamilton West by-election</h5>
              <span>10 December 2022</span><br>
              <ExternalLinkInline link="https://election.wheretheystand.nz">Interactive results</ExternalLinkInline>
            </div>
            <hr>
            <div class="election">
              <h5>2022 Tauranga by-election</h5>
              <span>18 June 2022</span><br>
              <ExternalLinkInline link="https://tauranga.election.wheretheystand.nz">Interactive results
              </ExternalLinkInline>
            </div>

          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_BASE } from '~~/stores/config';
const { data: homepageData } = await useFetch(
  API_BASE + 'client/homepage/'
)
</script>

<script>
import { parse, format, formatDistanceToNow } from 'date-fns'

export default {
  name: 'Home',
  components: {},
  methods: {
    relativeDate(date) {
      return formatDistanceToNow(parse(date, 'yyyy-MM-dd', new Date())) + " ago"
    },
    formattedDate(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
    },
    formattedDateFull(date) {
      return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
    }
  }
}
</script>

<style scoped>
#cover-image {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://storage.googleapis.com/wheretheystand-nz/nzpm_app/beehive.jpg');
  background-size: cover;
}

.vote-link, .bill-link {
  text-decoration: none
}

.vote-link:hover, .bill-link:hover {
  text-decoration: underline
}

.homepage-resource-list {
  padding: 0;
  list-style-type: none;
}
</style>
