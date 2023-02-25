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

          </Card>
        </div>
        <div class="col-12 col-xl-4">
          <h4>Recent votes</h4>
          <Card>

          </Card>
        </div>
        <div class="col-12 col-xl-4">
          <h4>Twitterer of the week</h4>
          <Card>

          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {}
}
</script>

<style scoped>
#cover-image {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://storage.googleapis.com/wheretheystand-nz/nzpm_app/beehive.jpg');
  background-size: cover;
}
</style>
