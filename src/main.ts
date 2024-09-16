import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './locales/i18n'

import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

const app = createApp(App)
app.use(createPinia())

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    trackComponents: true,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })

  // Save the original console.error function
  const originalConsoleError = console.error

  // Override console.error
  console.error = function (...args) {
    // Call the original console.error to log the error in the console
    originalConsoleError.apply(console, args)

    // Send the error to Sentry
    Sentry.captureException(new Error(args.join(' ')))
  }
}

app.use(router)
app.use(i18n)

app.mount('#app')
