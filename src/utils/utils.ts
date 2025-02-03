import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export function formatCredit(credit: number | undefined) {
  if (credit == undefined) {
    return 0
  } else {
    return (credit / 100).toFixed(2).replace('.',',')
  }
}
export function formatDate(date: string) {
  if (!date || date === '') return ''
  return new Date(date).toLocaleString()
}

// a function to export data as csv
// eslint-disable-next-line
export function exportAsCsv(data: Array<any>[], fileName: string) {
  let csv = ''

  data.forEach((row) => {
    csv += row.join(';')
    csv += '\n'
  })

  const anchor = document.createElement('a')
  anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  anchor.target = '_blank'
  anchor.style.visibility = 'hidden'
  anchor.download = `${fileName}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export function transformToFloat(num: number | string): number {
  if (typeof num === 'string') {
    return parseFloat(num.replace(',', '.'))
  }

  if (Number.isInteger(num)) {
    return parseFloat(num.toString())
  } else {
    return num
  }
}

export function initSentry(app: App, router: Router) {
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
    //eslint-disable-next-line
    const originalConsoleError = console.error

    // Override console.error
    //eslint-disable-next-line
    console.error = function (...args) {
      // Call the original console.error to log the error in the console
      originalConsoleError.apply(console, args)

      // Send the error to Sentry
      Sentry.captureException(new Error(args.join(' ')))
    }
  }
}
