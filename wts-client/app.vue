<template>
  <div class="app">

    <Head>
      <Meta name="twitter:card" content="summary" />
      <Meta name="twitter:site" content="@wheretheystand_" />
      <Meta name="twitter:title" content="WhereTheyStand" />
      <Meta name="twitter:description" content="See where your MP stands at wheretheystand.nz" />
      <Meta property="og:site_name" content="WhereTheyStand" />
      <Meta property="og:locale" content="en_NZ" />
      <Meta property="og:title" content="WhereTheyStand" />
      <Meta property="og:description" content="See where your MP stands at wheretheystand.nz" />
      <Link rel="apple-touch-icon" sizes="180x180"
        href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/apple-touch-icon.png" />
      <Link rel="icon" type="image/png" sizes="32x32"
        href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-32x32.png" />
      <Link rel="icon" type="image/png" sizes="16x16"
        href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-16x16.png" />
      <Link rel="manifest" href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/site.webmanifest" />
      <Link rel="mask-icon"
        href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/safari-pinned-tab.svg" color="#58787f" />
      <Link rel="shortcut icon" href="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon.ico" />
      <Meta name="msapplication-TileColor" content="#58787f" />
      <Meta name="msapplication-config"
        content="https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/browserconfig.xml" />
      <Meta name="theme-color" content="#58787f" />
    </Head>
    <div class="flex-wrapper-gx">
      <div class="gx-non-footer">
        <Banners></Banners>
        <Navbar></Navbar>
        <NuxtPage class="content-wrapper" />
      </div>

      <Footer></Footer>
    </div>

    <Toasts></Toasts>
  </div>
</template>

<script setup>
import { useNotificationsStore } from './stores/notifications';

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} — WhereTheyStand` : 'WhereTheyStand';
  },
  meta: [
    { name: 'description', content: 'WhereTheyStand aggregates and links information about Members of Parliament and political parties, allowing you to find relevant information easily.' }
  ],
})
</script>

<style>
a {
  text-decoration: none
}

a:hover {
  text-decoration: underline;
}


.flex-wrapper-gx {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
}

:root {
  --wts-solid: #58787f;
  --wts-gradient: linear-gradient(225deg,
      rgb(52, 148, 148) 0%,
      var(--wts-solid) 100%);
  /*--wts-gradient: linear-gradient(225deg, rgb(219, 83, 83), rgba(88,120,127,1) 100%);*/
  --wts-secondary: #d8d8d8;
  --wts-body: "Open Sans", "Arial", sans-serif;
  --wts-display: "Mulish", "Open Sans", "Arial", sans-serif;
  --wts-card-bg: white;
  --wts-card-bg-hover: rgb(230, 230, 230);
  /*--wts-card-border-radius: 0px;*/
  --wts-card-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /*--wts-card-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);*/
  --wts-paper: rgb(238, 234, 224);
}

body {
  font-family: var(--wts-body);
  display: flex;
  flex-direction: column;
  background-color: var(--wts-paper);
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

.container {
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
}

.container-main {
  padding-bottom: 110px;
  padding-top: 40px;
}

.container h1,
.container h2,
.container h3,
.container h4,
.container h5,
.container h6 {
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

.hans-reader-carousel>h5 {
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

