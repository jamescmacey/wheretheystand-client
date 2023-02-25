import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: [
        '~/assets/scss/main.scss'
    ],
    plugins: [
        '~/plugins/vue-gtag.client.js',
        '~/plugins/fontawesome.js',
        '~/plugins/vue-mapbox.js',
        '~/plugins/instantsearch.js'
    ],
    //build: { transpile: ['vue-mapbox-ts'] },
    buildModules: [
        '@pinia/nuxt',
      ],
})
