import type * as SentryModule from '@sentry/vue'

type Sentry = typeof SentryModule

let sentry: Sentry | undefined

// The SDK is a large download, so the shop does not import it directly: sentryInit.ts loads
// it in the background and registers it here. Until then, and without a DSN, nothing is
// reported, as Sentry would not send events before its init anyway.
export function registerSentry(module: Sentry | undefined): void {
  sentry = module
}

export function getSentry(): Sentry | undefined {
  return sentry
}

// The Docker image replaces the build-time placeholder with the real DSN when the container
// starts, so whether a DSN is set can only be decided at runtime
export const sentryDsn: string = import.meta.env.VITE_SENTRY_DSN ?? ''

export function sentryConfigured(dsn: string = sentryDsn): boolean {
  return /^https?:\/\//.test(dsn)
}
