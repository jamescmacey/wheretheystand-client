import VueMapboxTs from "vue-mapbox-ts"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueMapboxTs)
})