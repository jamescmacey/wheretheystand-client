// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/algolia', '@pinia/nuxt', 'nuxt-gtag', 'vue-recaptcha/nuxt', 'nuxt-mapbox', '@nuxt/ui', '@nuxtjs/robots'],
  css: [
    '~/assets/css/main.css',
  ],
  gtag: {
    id: 'G-WBR7239726'
  },
  algolia: {
    apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
    applicationId: process.env.ALGOLIA_APPLICATION_ID,
    instantSearch: {
      theme: 'reset'
    }
  },
  mapbox: {
    accessToken: 'pk.eyJ1IjoiamFtZXNjbWFjZXkiLCJhIjoiY2xiN2VhYzVqMGE5YTN2bnhuM3l6d3pxbyJ9.CN_c4Tf7wXMtxyLKWrtvJg'
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://wheretheystand.nz/api/',
    },
  },
  site: { indexable: false },
  ssr: true
})