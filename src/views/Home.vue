<template>
  <div>
    <div
      class="jumbotron jumbotron-fluid"
    >
      <div class="container text-center">
        <h1 class="display-4">Wondering where they stand?</h1>
        <hr />
        <h3>
          WhereTheyStand aggregates voting data, financial information,
          biographical information, and more.
        </h3>
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
.jumbotron {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('https://storage.googleapis.com/wheretheystand-nz/nzpm_app/beehive.jpg');
  background-size: cover;
}
</style>
