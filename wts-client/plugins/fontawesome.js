import { library, config } from '@fortawesome/fontawesome-svg-core'
import { faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faInfoCircle, faArrowRight, faPeopleGroup, faPerson, faArrowLeft, faFileCsv, faFileCode, faFileExcel, faBook, faFileLines, faForwardFast, faCalendar, faPenNib, faMicrophoneLines } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW, faInfoCircle, faArrowRight, faPeopleGroup, faPerson, faArrowLeft, faFileCsv, faFileCode, faFileExcel, faBook, faFileLines, faForwardFast, faCalendar, faPenNib, faMicrophoneLines)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})