<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-theme1">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">WhereTheyStand</NuxtLink>

      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/people/') ? 'active nav-link' : 'nav-link']" to="/people/" active-class="active">People</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/parties/') ? 'active nav-link' : 'nav-link']" to="/parties/" active-class="active">Parties</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/electorates/') ? 'active nav-link' : 'nav-link']" to="/electorates/" active-class="active">Electorates</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/bills/') ? 'active nav-link' : 'nav-link']" to="/bills/" active-class="active">Bills
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/votes/') ? 'active nav-link' : 'nav-link']" to="/votes/" active-class="active">Votes
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/hansard/') ? 'active nav-link' : 'nav-link']" to="/hansard/" active-class="active">Hansard</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink :class="[$route.fullPath.startsWith('/about/') ? 'active nav-link' : 'nav-link']" to="/about/" active-class="active">About</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  font-family: "Open Sans", sans-serif;
  font-weight: 600;
}

.navbar-brand {
  padding: 0 15px;
  font-family: "Mulish", sans-serif;
  font-weight: 700;
}

.special-font {
  font-family: "Mulish", sans-serif;
  font-weight: 700;
}

.navbar-brand .sub {
  font-weight: 400;
  font-size: 50%;
}

.navbar-nav .sub {
  font-weight: 400;
  font-size: 75%;
}

.navbar-toggle {
  margin-top: 23px;
  padding: 9px 10px !important;
}

.navbar-nav>li>a {
  /* (80px - line-height of 27px) / 2 = 26.5px */
  line-height: 27px;
  color: rgba(146, 146, 146, 1);
}
</style>

<script>
export default {
  name: 'Navbar'
}
</script>