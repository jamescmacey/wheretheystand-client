<template>
    <UApp>
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
    <NuxtLoadingIndicator />
    <NuxtLayout v-if="route.name === 'elections'" name="elections">
      <NuxtPage />
    </NuxtLayout>
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
    
</template>

<script setup>
import { useNotificationsStore } from './stores/notifications';
const route = useRoute()
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

</style>

