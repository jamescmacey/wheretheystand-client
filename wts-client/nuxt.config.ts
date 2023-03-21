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
    ],
    build: {
        //transpile: ['chart.js']
        //transpile: ['vue-mapbox-ts', 'chart.js'] 
    },
    buildModules: [
        '@pinia/nuxt',
    ],
})
