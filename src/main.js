import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueToast from 'vue-toast-notification'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW)

createApp(App).use(store).use(router).use(VueToast).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
