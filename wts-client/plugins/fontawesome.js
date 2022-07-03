import { library, config } from '@fortawesome/fontawesome-svg-core'
import { faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW, faInfoCircle)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})