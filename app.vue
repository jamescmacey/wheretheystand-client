<template>
    <UApp :locale="en_gb">
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
        href="/favicons/apple-touch-icon.png" />
      <Link rel="icon" type="image/png" sizes="32x32"
        href="/favicons/favicon-32x32.png" />
      <Link rel="icon" type="image/png" sizes="16x16"
        href="/favicons/favicon-16x16.png" />
     <Link rel="shortcut icon" href="/favicons/favicon.ico" />
      <Meta name="msapplication-TileColor" content="#58787f" />
      <Meta name="theme-color" content="#58787f" />
    </Head>
    
    <NuxtLayout v-if="route.name && route.name.startsWith('elections') && route.name !== 'elections'" name="elections">
      <NuxtPage />
    </NuxtLayout>
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>

    <AppLoadingIndicator />
  </UApp>
    
</template>

<script setup>
import { en_gb } from "@nuxt/ui/locale"

const route = useRoute()
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} — WhereTheyStand` : 'WhereTheyStand';
  },
  meta: [
    { name: 'description', content: DEFAULT_SITE_DESCRIPTION }
  ],
})
</script>

<style>

</style>

