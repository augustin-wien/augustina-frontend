import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './locales/i18n'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.use(i18n)
app.use(router)

app.mount('#app')
