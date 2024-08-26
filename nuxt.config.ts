// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/algolia', '@pinia/nuxt', 'nuxt-gtag'],
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
  css: [
    '~/assets/scss/main.scss',
  ],
  plugins: [
      '~/plugins/bootstrap.client.js',
      '~/plugins/fontawesome.js',
  ],
  build: {
      transpile: ['chart.js']
  },
  ssr: true,
  vue: {
      compilerOptions: {
          // treat any tag that starts with passage- as custom elements
          isCustomElement: (tag) => tag.startsWith('passage-'),
      }
  }
})