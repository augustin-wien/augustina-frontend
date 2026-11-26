import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './locales/i18n'

import App from './App.vue'
import router from './router'
import { sentryConfigured } from './utils/sentry'

const app = createApp(App)
app.use(createPinia())

app.use(router)
app.use(i18n)
app.mount('#app')

// Sentry loads in the background, so the shop does not wait for it before it is shown
if (sentryConfigured()) {
  import('./utils/sentryInit').then(({ initSentry }) => initSentry(app, router))
}
