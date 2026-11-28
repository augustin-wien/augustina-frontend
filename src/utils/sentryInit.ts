import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import { isNavigationFailure, type Router } from 'vue-router'
import { registerSentry, sentryConfigured, sentryDsn } from '@/utils/sentry'

// Keycloak's OIDC redirect briefly leaves the auth code/tokens in the URL (query or
// fragment) before keycloak-js strips them - any error or navigation breadcrumb captured
// in that window would otherwise ship the raw code/access_token/id_token to Sentry/
// GlitchTip verbatim. Origin + path carries all the debugging value we actually need, so
// drop query and fragment unconditionally rather than trying to denylist individual params.
function stripSensitiveUrlParts(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.origin + parsed.pathname
  } catch {
    return url
  }
}

export function initSentry(app: App, router: Router) {
  if (sentryConfigured()) {
    Sentry.init({
      app,
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      ignoreErrors: [
        // Vue Router's own signal when a navigation guard redirects or denies a
        // navigation (e.g. our auth guard bouncing an unauthenticated user to login) -
        // expected control flow, not a bug.
        /^Navigation (aborted|cancelled|duplicated) from/,
        // Vite's dev-only HMR client retrying a failed module reload, and the
        // temporal-dead-zone race that follows when a route's lazy-loaded component is
        // hot-swapped mid-import. Both are local dev-tooling noise, not app bugs.
        /^\[vite\] Failed to reload/,
        /before initialization$/
      ],

      beforeSend(event, hint) {
        if (isNavigationFailure(hint?.originalException)) {
          return null
        }

        if (event.request?.url) {
          event.request.url = stripSensitiveUrlParts(event.request.url)
        }

        return event
      },
      beforeSendTransaction(event) {
        if (event.request?.url) {
          event.request.url = stripSensitiveUrlParts(event.request.url)
        }

        return event
      },
      beforeBreadcrumb(breadcrumb) {
        if (typeof breadcrumb.data?.url === 'string') {
          breadcrumb.data.url = stripSensitiveUrlParts(breadcrumb.data.url)
        }

        if (typeof breadcrumb.data?.to === 'string') {
          breadcrumb.data.to = stripSensitiveUrlParts(breadcrumb.data.to)
        }

        if (typeof breadcrumb.data?.from === 'string') {
          breadcrumb.data.from = stripSensitiveUrlParts(breadcrumb.data.from)
        }

        return breadcrumb
      }
    })

    // One frontend build is served behind every paper's shop domain, so tag events by
    // hostname - otherwise every tenant's errors land in Sentry/GlitchTip indistinguishable.
    Sentry.setTag('tenant', window.location.hostname)
    registerSentry(Sentry)

    // Save the original console.error function
    //eslint-disable-next-line
    const originalConsoleError = console.error

    // Override console.error
    //eslint-disable-next-line
    console.error = function (...args) {
      // Call the original console.error to log the error in the console
      originalConsoleError.apply(console, args)

      // Production builds of Vue Router log navigation failures without a message, so the
      // ignoreErrors pattern above does not catch them
      if (args.some((arg) => isNavigationFailure(arg))) {
        return
      }

      // Many call sites already pass the real Error alongside a message, e.g.
      // console.error('Error creating vendor:', error). Forward that real error so Sentry
      // groups by its actual stack trace instead of by the joined string, which differs
      // per call (order ids, timestamps, ...) and would never group repeats together.
      const realError = args.find((arg): arg is Error => arg instanceof Error)

      if (realError) {
        Sentry.captureException(realError)
      } else {
        Sentry.captureException(new Error(args.join(' ')))
      }
    }
  }
}
