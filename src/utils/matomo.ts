import type { Router } from 'vue-router'

/** The part of the backend settings this module cares about. */
export interface MatomoSettings {
  MatomoUrl?: string
  MatomoSiteId?: string
}

declare global {
  interface Window {
    _paq?: unknown[][]
  }
}

const TRACKER_SCRIPT_ID = 'matomo-tracker'

/**
 * Opt-out is kept in localStorage rather than in Matomo's own opt-out cookie: tracking runs
 * cookieless, so there is no cookie to put it in, and this way an opted-out visitor never even
 * loads the tracker.
 */
const OPT_OUT_KEY = 'matomo-opt-out'

/** Set once the visitor has dismissed the privacy notice, so it is shown once and not again. */
const NOTICE_KEY = 'matomo-notice-seen'

/**
 * Analytics is about the public shop. The backoffice is an internal tool — no page views, no
 * clicks, and the tracker is not even loaded while someone is in there.
 */
const UNTRACKED_PATH_PREFIXES = ['/backoffice']

const CLICKABLE = 'a, button, [role="button"], input[type="submit"], input[type="button"]'

/** Long enough to tell buttons apart, short enough not to ship whole paragraphs. */
const MAX_LABEL_LENGTH = 60

let initialized = false

/**
 * Matomo is opt-in per tenant. There is no separate on/off switch: an instance is tracked once
 * both the url and the site id are configured in the backoffice, and not before.
 */
export function isMatomoConfigured(settings: MatomoSettings): boolean {
  return Boolean(trackerBaseUrl(settings.MatomoUrl ?? '') && settings.MatomoSiteId?.trim())
}

export function isTrackablePath(path: string): boolean {
  return !UNTRACKED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Whether this visitor has opted out of being counted. */
export function isMatomoOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === 'true'
  } catch {
    // Private mode or blocked storage: treat it as opted in, the visitor can opt out again.
    return false
  }
}

/** Whether the privacy notice has already been acknowledged. */
export function isPrivacyNoticeSeen(): boolean {
  try {
    return window.localStorage.getItem(NOTICE_KEY) === 'true'
  } catch {
    // Storage blocked: better to show the notice again than to swallow it.
    return false
  }
}

export function markPrivacyNoticeSeen(): void {
  try {
    window.localStorage.setItem(NOTICE_KEY, 'true')
  } catch {
    // Nothing to remember it in — the notice will come back, which is the harmless direction.
  }
}

/**
 * Opting out stops tracking straight away and survives a reload. Opting back in only takes effect
 * on the next page load — the tracker is not loaded retroactively.
 */
export function setMatomoOptOut(optedOut: boolean): void {
  try {
    if (optedOut) {
      window.localStorage.setItem(OPT_OUT_KEY, 'true')
    } else {
      window.localStorage.removeItem(OPT_OUT_KEY)
    }
  } catch {
    // Storage unavailable — at least stop the running tracker below.
  }

  if (optedOut) {
    window._paq?.push(['optUserOut'])
    window._paq?.push(['disableTracking'])
    document.removeEventListener('click', trackClick, true)
  } else {
    window._paq?.push(['forgetUserOptOut'])
  }
}

const withTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`)

/**
 * Resolves the configured url, but only if it is http(s). The value ends up as the src of a
 * <script> tag on every shop page, so anything else must not get through: a "data:text/javascript,
 * ..." url would execute its own content in the shop's origin, turning a backoffice setting into
 * stored XSS against every visitor. Returns null when the url is unusable.
 */
const trackerBaseUrl = (raw: string): string | null => {
  const value = raw.trim()

  if (value === '') return null

  let parsed: URL

  try {
    parsed = new URL(value, window.location.origin)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  return withTrailingSlash(parsed.href)
}

/**
 * Only the path is reported, never the query string. Payment confirmations and vendor links carry
 * order codes and tokens in the query, and those have no business in the analytics.
 */
const pageUrl = (path: string) => `${window.location.origin}${path}`

/** Loads the tracker on first use. Doing this lazily keeps the backoffice off Matomo entirely. */
const startTracker = (url: string, siteId: string) => {
  if (document.getElementById(TRACKER_SCRIPT_ID)) return

  const paq: unknown[][] = window._paq ?? []

  window._paq = paq

  // Cookieless tracking — this keeps the shop free of a consent banner.
  paq.push(['disableCookies'])
  paq.push(['enableLinkTracking'])
  paq.push(['setTrackerUrl', `${url}matomo.php`])
  paq.push(['setSiteId', siteId])

  const script = document.createElement('script')

  script.id = TRACKER_SCRIPT_ID
  script.async = true
  script.src = `${url}matomo.js`
  document.head.appendChild(script)
}

const trackPageView = (path: string, referrerPath?: string) => {
  const paq = window._paq

  if (!paq) return

  if (referrerPath) paq.push(['setReferrerUrl', pageUrl(referrerPath)])

  paq.push(['setCustomUrl', pageUrl(path)])
  paq.push(['setDocumentTitle', document.title])
  paq.push(['trackPageView'])
  // Re-scan for outbound links, the old ones are gone after a route change.
  paq.push(['enableLinkTracking'])
}

/** What the element says, in the order that gives the most recognisable label. */
export function clickLabel(element: Element): string {
  const label =
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.textContent?.trim() ||
    element.getAttribute('name') ||
    element.id ||
    element.tagName.toLowerCase()

  return label.replace(/\s+/g, ' ').slice(0, MAX_LABEL_LENGTH)
}

const trackClick = (event: MouseEvent) => {
  const paq = window._paq

  if (!paq) return

  const target = event.target
  const element = target instanceof Element ? target.closest(CLICKABLE) : null

  if (!element) return

  const path = window.location.pathname

  if (!isTrackablePath(path)) return

  paq.push(['trackEvent', 'Click', clickLabel(element), path])
}

/**
 * Loads the Matomo tracker and reports a page view for every route change plus an event for every
 * click on a button or link — outside the backoffice.
 *
 * Returns false when the tenant has no Matomo configured or this already ran, so nothing is
 * loaded and no request leaves the browser.
 */
export function initMatomo(settings: MatomoSettings, router: Router): boolean {
  if (initialized || isMatomoOptedOut()) return false

  const url = trackerBaseUrl(settings.MatomoUrl ?? '')
  const siteId = (settings.MatomoSiteId ?? '').trim()

  // Not configured, or configured with something that must not become a <script src>.
  if (!url || siteId === '') return false

  initialized = true

  const visit = (path: string, referrerPath?: string) => {
    if (!isTrackablePath(path)) return

    startTracker(url, siteId)
    trackPageView(path, referrerPath)
  }

  // The settings arrive asynchronously, so the first route is usually already resolved by now and
  // afterEach would not fire for it. "Usually" is not always though: before the router finishes
  // its first navigation it still sits on the start location, whose path is "/" and which matches
  // no route. Counting that would add a phantom home page view to every single visit — afterEach
  // reports the real route a moment later.
  if (router.currentRoute.value.matched.length > 0) {
    visit(router.currentRoute.value.path)
  }

  router.afterEach((to, from) => {
    if (to.path === from.path) return

    visit(to.path, isTrackablePath(from.path) ? from.path : undefined)
  })

  document.addEventListener('click', trackClick, true)

  return true
}

/** Test seam — the tracker is a one-shot per page load in the app itself. */
export function resetMatomo(): void {
  initialized = false
  document.removeEventListener('click', trackClick, true)
  document.getElementById(TRACKER_SCRIPT_ID)?.remove()
  delete window._paq

  try {
    window.localStorage.removeItem(OPT_OUT_KEY)
    window.localStorage.removeItem(NOTICE_KEY)
  } catch {
    // nothing to clean up
  }
}
