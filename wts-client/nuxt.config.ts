// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: [
        '~/assets/scss/main.scss',
    ],
    plugins: [
        '~/plugins/bootstrap.client.js',
        '~/plugins/fontawesome.js',
        '~/plugins/vue-gtag.client.js'
    ],
    build: {
        //transpile: ['chart.js']
        transpile: ['chart.js'] 
    },
    modules: [
        '@pinia/nuxt'
    ],
    ssr: true
})
