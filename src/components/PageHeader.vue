<template>
  <div class="container-fluid hero">
  <div class="container">
    <h1 class="hero">{{ pageTitle }}</h1>
    <h3 class="hero" v-if="pageSubtitle">{{ pageSubtitle }}</h3>
    <nav class="navbar navbar-expand-lg navbar-light sub-nav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="#">All debates</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Topics</a>
        </li>
        <li class="nav-item">
          <form
                  id="sub-nav-search"
                  class="form-inline mx-3"
                  action="/hansard/search/"
                  method="get"
          >
            <input
                    class="nav-link form-control form-control-sm mr-sm-2"
                    id="q"
                    name="q"
                    type="search"
                    placeholder="Search speeches"
                    aria-label="Speeches search"
            />
          </form>
        </li>
      </ul>
    </nav>
  </div>
</div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: [
    'pageTitle',
    'pageSubtitle'
  ]
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
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
</style>
