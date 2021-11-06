<template>
  <div class="app">

  <nav class="navbar navbar-expand-lg navbar-dark">
    <router-link class="navbar-brand" to="/">WhereTheyStand</router-link>

    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto jcm-navbar-nav-top">
        <li class="nav-item">
          <router-link class="nav-link" to="/people/" active-class="active">People</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/parties/" active-class="active">Parties</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/bills-and-votes/" active-class="active">Bills and Votes</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/hansard/" active-class="active">Hansard</router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/docs/about/">About</a>
        </li>

        <li class="nav-item">
          <form
            id="site-search-box"
            class="form-inline mx-3"
            action="/search/"
            method="get"
          >
            <input
              class="form-control form-control-sm mr-sm-2"
              id="q"
              name="q"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
          </form>
        </li>
      </ul>
    </div>
  </nav>
  <router-view class="content-wrapper" />

  <footer class="footer text-light">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-4">
          <h5>Pages</h5>
          <hr />
          <ul style="list-style: none; padding-left: 0">
            <li><a class="a-no-format text-light" href="/people">People</a></li>
            <li>
              <a class="a-no-format text-light" href="/parties">Parties</a>
            </li>
            <li>
              <a class="a-no-format text-light" href="/bills"
                >Bills and Votes</a
              >
            </li>
            <li>
              <a class="a-no-format text-light" href="/electorates"
                >Electorates</a
              >
            </li>
            <li><a class="a-no-format text-light" href="/data/">Data</a></li>
          </ul>
        </div>
        <div class="col-12 col-lg-4">
          <h5>About</h5>
          <hr />
          <ul style="list-style: none; padding-left: 0">
            <li>
              <a class="a-no-format text-light" href="/docs/about"
                >About WhereTheyStand</a
              >
            </li>
            <li>
              <a class="a-no-format text-light" href="/feedback"
                >Submit feedback</a
              >
            </li>
            <li>
              <a class="a-no-format text-light" href="/corrections"
                >Submit corrections</a
              >
            </li>
            <li>
              <a class="a-no-format text-light" href="/docs/copyright"
                >Copyright</a
              >
            </li>
          </ul>
        </div>
        <div class="col-12 col-lg-4">
          <h5>Social media</h5>
          <hr />
          <ul style="list-style: none; padding-left: 0">
            <li>
              <a
                class="a-no-format text-light"
                href="https://twitter.com/wherestandnz"
                >Twitter</a
              >
            </li>
            <card :gradient='true'>
              <h5>Like WhereTheyStand?</h5>
              <p>You can shout me a hot chocolate (or two).</p>
            </card>
          </ul>
        </div>
      </div>

      <p>
        <i
          ><a
            class="a-no-format text-light"
            href="https://commons.wikimedia.org/wiki/File:Beehive_and_Parliament_House_in_New_Zealand.jpg"
            >Header image by Wikimedia user "Melonblob", used under CC BY-SA
            4.0. Cropped and resized.</a
          ></i
        >
      </p>

      <hr />
      <h4>
        <a
          class="a-no-format text-light special-font"
          href="https://wheretheystand.nz"
          >wheretheystand.nz</a
        >
      </h4>
    </div>
  </footer>
  </div>
</template>

<script>
import Card from './components/Card.vue'

export default {
  name: 'App',
  components: {
    Card
  }
}
</script>

<style>
:root {
  --wts-solid: #58787f;
  --wts-gradient: linear-gradient(
    225deg,
    rgb(52, 148, 148) 0%,
    var(--wts-solid) 100%
  );
  /*--wts-gradient: linear-gradient(225deg, rgb(219, 83, 83), rgba(88,120,127,1) 100%);*/
  --wts-secondary: #d8d8d8;
  --wts-body: "Open Sans", "Arial", sans-serif;
  --wts-display: "Mulish", "Open Sans", "Arial", sans-serif;
  --wts-card-bg: white;
  --wts-card-border-radius: 0px;
  /*--wts-card-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
  --wts-card-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  --wts-paper: rgb(238, 234, 224);
}

body {
  font-family: var(--wts-body);
  display: flex;
  flex-direction: column;
  background-color: var(--wts-paper);
}

.footer {
    margin-top: 10px;
    padding-top: 20px;
    padding-bottom: 10px;
    background-color: var(--wts-solid);
    flex-shrink: none;
}

.content-wrapper {
  flex: 1 0 auto;
}

p {
  margin-top: 1em;
  margin-bottom: 1em;
}

h1.hero,
h2.hero,
h3.hero,
h4.hero,
h5.hero,
h6.hero {
  color: white;
}

div.hero {
  padding: 30px 0px;
  /*background-image: var(--wts-gradient);*/
}

.display {
  font-family: var(--wts-display);
  font-weight: 700;
}

a.no-format {
  color: inherit;
  text-decoration: inherit;
}

span.party-dot {
  height: 0.8em;
  width: 0.8em;
  border-radius: 50%;
  display: inline-block;
  margin-right: 2px;
}

.person-card {
  padding: 15px 15px;
  background-color: var(--wts-card-bg);
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
}

.person-card h3 {
  margin-bottom: 0;
}

.person-card p {
  margin-bottom: 0;
}

/* NAVIGATION BAR */
.navbar {
  font-family: "Open Sans", sans-serif;
  font-weight: 600;
  background-color: var(--wts-solid);
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

.navbar-nav > li > a {
  /* (80px - line-height of 27px) / 2 = 26.5px */
  line-height: 27px;
  color: rgba(146, 146, 146, 1);
}

.container {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
}

.container-main {
    padding-bottom: 110px;
    padding-top: 40px;
}

.container h1, .container h2, .container h3, .container h4, .container h5, .container h6 {
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
}

.container .btn {
    font-family: 'Open Sans', sans-serif;
}

/* Voting */
span.dot-yes,
span.dot-no,
span.dot-absent,
span.dot-abstain {
  height: 0.8em;
  width: 0.8em;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

span.dot-yes {
  background-color: #28a745;
}

span.dot-no {
  background-color: #dc3545;
}

span.dot-absent {
  background-color: #007bff;
}

span.dot-abstain {
  background-color: #ffc107;
}

.entity-vote-collection {
  margin: 10px 0px;
  padding: 15px 15px;
  background-color: var(--wts-card-bg);
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
}

ul.entity-vote-list {
  list-style: none;
  padding: 0;
}

.entity-vote-collection a {
  padding: 0;
}

.vote-inset {
  border-radius: var(--wts-card-border-radius);
  border-color: black;
  border-width: 1px;
  border-style: solid;
}

.vote-inset p {
  margin: 0;
}

/* Insights */

ul.no-format {
  list-style: none;
  padding: 0;
}

.person-image {
  border-radius: 50%;
  height: 64px;
  width: auto;
}

.person-image-lg {
  border-radius: 50%;
  height: 128px;
  width: auto;
}

.person-inset {
  border-radius: var(--wts-card-border-radius);
  border-color: black;
  border-width: 1px;
  border-style: solid;
}

.person-inset p {
  margin: 0;
}

.person-inset .media {
  width: auto;
}

.sub-nav {
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
  background-color: var(--wts-card-bg);
}

.modal-content.wts-modal {
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
  background-color: var(--wts-card-bg);
}

.help-button {
  border: none;
  background-color: inherit;
  color: inherit;
}

/* HANSARD */

.hans-content {
  text-align: justify;
}

.hans-variable-font h1 {
  font-size: 2em;
}

.hans-variable-font h2 {
  font-size: 1.5em;
}

.hans-variable-font h3 {
  font-size: 1.17em;
}

.hans-variable-font h4 {
  font-size: 1em;
}

.hans-variable-font h5 {
  font-size: 0.83em;
}

.hans-variable-font h6 {
  font-size: 0.67em;
}

.hans-reader-carousel {
  background-color: var(--wts-card-bg);
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
  text-align: center;
  margin: 0px;
  padding-top: 10px;
  padding-bottom: 5px;
}

.hans-reader-carousel > h5 {
  padding: 0px;
}

.hans-reader-carousel-back {
  text-align: left;
}

.hans-reader-carousel-forward {
  text-align: right;
}

.hans-reader-carousel-current {
  font-weight: 600;
}

.hans-progress-bar {
  background-color: var(--wts-solid);
}

.hans-reader-sidebar {
  padding-left: 0px;
}

.hans-reader-sidebar-button,
.hans-reader-sidebar-button:focus {
  border: none;
  background-color: inherit;
  color: inherit;
  margin: 0px;
  padding: 0px;
  width: 100%;
  outline: inherit;
}

.hans-reader-sidebar-status {
  font-weight: 600;
}

.hans-reader-inline-entity {
  background-color: rgba(161, 213, 237, 0.3);
  padding: 0px 3px;
  border-radius: 2px;
  display: inline-block;
  cursor: pointer;
}

.hans-reader-inline-glossary {
  border-bottom: black 1px dotted;
  cursor: pointer;
}

.hans-reader-inline-topic {
  border-bottom: black 1px dotted;
  cursor: pointer;
}

.hans-reader-button-no-format,
.hans-reader-button-no-format:focus {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

#hans-reader .hans-sans-serif .hans-variable-font {
  font-family: "Open Sans", sans-serif;
}

#hans-reader .hans-serif .hans-variable-font {
  font-family: Georgia, serif;
}

.hans-reader-carousel-spinner {
  color: var(--wts-solid);
  height: 1.25rem;
  width: 1.25rem;
}

.hans-reader-indent-1,
.hans-reader-indent-2 {
  border-left: 2px solid var(--wts-solid);
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}

.hans-reader-indent-1 p,
.hans-reader-indent-2 p {
  margin-top: 0em;
  margin-bottom: 0em;
  margin-left: 10px;
  font-size: 0.9em;
}

.hans-reader-indent-1 {
  margin-left: 10%;
}

.hans-reader-indent-2 {
  margin-left: 10%;
  padding-left: 10%;
}
</style>
