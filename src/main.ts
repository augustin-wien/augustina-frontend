import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './locales/i18n'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())

if (import.meta.env.VITE_SENTRY_DSN) {
  import('./utils/utils').then(({ initSentry }) => {
    initSentry(app, router)
    app.use(router)
    app.use(i18n)

    app.mount('#app')
  })
} else {
  app.use(router)
  app.use(i18n)

  app.mount('#app')
}
