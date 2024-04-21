import './assets/main.css'
import 'primevue/resources/themes/aura-dark-purple/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Sidebar from 'primevue/sidebar'
import Tree from 'primevue/tree'

// Components

import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue)
// Load components
app.component('Sidebar', Sidebar)
app.component('Tree', Tree)

app.mount('#app')
