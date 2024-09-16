import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './locales/i18n'
import {initSentry} from './utils/utils'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())

initSentry(app, router)

app.use(router)
app.use(i18n)

app.mount('#app')
