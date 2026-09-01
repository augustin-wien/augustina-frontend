import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import {
  clickLabel,
  initMatomo,
  isMatomoConfigured,
  isMatomoOptedOut,
  isPrivacyNoticeSeen,
  isTrackablePath,
  markPrivacyNoticeSeen,
  resetMatomo,
  setMatomoOptOut
} from '@/utils/matomo'

const CONFIGURED = { MatomoUrl: 'https://matomo.example.org/', MatomoSiteId: '3' }

const buildRouter = (): Router =>
  createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/v/:id/landing-page', name: 'landing', component: { template: '<div />' } },
      { path: '/backoffice/settings', name: 'settings', component: { template: '<div />' } },
      { path: '/backoffice/vendorsummary', name: 'vendors', component: { template: '<div />' } }
    ]
  })

const tracker = () => document.getElementById('matomo-tracker') as HTMLScriptElement | null

const calls = (command: string) => (window._paq ?? []).filter(([name]) => name === command)

const clickOn = (element: Element) =>
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

const cleanDom = () => {
  resetMatomo()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
}

describe('isMatomoConfigured', () => {
  it('needs both the url and the site id', () => {
    expect(isMatomoConfigured(CONFIGURED)).toBe(true)
    expect(isMatomoConfigured({ MatomoUrl: 'https://matomo.example.org/' })).toBe(false)
    expect(isMatomoConfigured({ MatomoSiteId: '3' })).toBe(false)
    expect(isMatomoConfigured({})).toBe(false)
  })

  it('does not count whitespace as configured', () => {
    expect(isMatomoConfigured({ MatomoUrl: '   ', MatomoSiteId: '3' })).toBe(false)

    expect(
      isMatomoConfigured({ MatomoUrl: 'https://matomo.example.org/', MatomoSiteId: ' ' })
    ).toBe(false)
  })
})

describe('isTrackablePath', () => {
  it('excludes the backoffice', () => {
    expect(isTrackablePath('/backoffice')).toBe(false)
    expect(isTrackablePath('/backoffice/settings')).toBe(false)
    expect(isTrackablePath('/backoffice/vendorsummary')).toBe(false)
  })

  it('includes the public shop', () => {
    expect(isTrackablePath('/')).toBe(true)
    expect(isTrackablePath('/v/42/landing-page')).toBe(true)
  })

  it('does not confuse a path that merely starts with the same letters', () => {
    expect(isTrackablePath('/backoffice-help')).toBe(true)
  })
})

describe('clickLabel', () => {
  const element = (html: string) => {
    const host = document.createElement('div')

    host.innerHTML = html

    return host.firstElementChild as Element
  }

  it('prefers the aria label over the text', () => {
    expect(clickLabel(element('<button aria-label="Close">×</button>'))).toBe('Close')
  })

  it('falls back to the text, collapsed to one line', () => {
    expect(clickLabel(element('<button>  Buy   a\n newspaper </button>'))).toBe('Buy a newspaper')
  })

  it('falls back to the tag when there is nothing to read', () => {
    expect(clickLabel(element('<button></button>'))).toBe('button')
  })

  it('does not ship whole paragraphs', () => {
    expect(clickLabel(element(`<button>${'x'.repeat(200)}</button>`)).length).toBe(60)
  })
})

describe('initMatomo', () => {
  let router: Router

  beforeEach(async () => {
    cleanDom()
    router = buildRouter()
    router.push('/')
    await router.isReady()
  })

  afterEach(cleanDom)

  it('loads nothing for a tenant without Matomo', () => {
    expect(initMatomo({}, router)).toBe(false)
    expect(tracker()).toBeNull()
    expect(window._paq).toBeUndefined()
  })

  it('loads the tracker from the configured instance', () => {
    expect(initMatomo(CONFIGURED, router)).toBe(true)

    expect(tracker()?.src).toBe('https://matomo.example.org/matomo.js')
    expect(tracker()?.async).toBe(true)

    expect(calls('setTrackerUrl')[0]).toEqual([
      'setTrackerUrl',
      'https://matomo.example.org/matomo.php'
    ])

    expect(calls('setSiteId')[0]).toEqual(['setSiteId', '3'])
  })

  it('adds the missing slash to the configured url', () => {
    initMatomo({ MatomoUrl: 'https://matomo.example.org', MatomoSiteId: '3' }, router)

    expect(tracker()?.src).toBe('https://matomo.example.org/matomo.js')
  })

  it('tracks without cookies so the shop needs no consent banner', () => {
    initMatomo(CONFIGURED, router)

    expect(calls('disableCookies')).toHaveLength(1)
  })

  it('reports the page that is already open when the settings arrive', () => {
    initMatomo(CONFIGURED, router)

    expect(calls('trackPageView')).toHaveLength(1)
    expect(calls('setCustomUrl')[0]).toEqual(['setCustomUrl', `${window.location.origin}/`])
  })

  it('reports a page view for every route change, with the previous page as referrer', async () => {
    initMatomo(CONFIGURED, router)

    await router.push('/v/42/landing-page')

    expect(calls('trackPageView')).toHaveLength(2)

    expect(calls('setCustomUrl').map(([, url]) => url)).toEqual([
      `${window.location.origin}/`,
      `${window.location.origin}/v/42/landing-page`
    ])

    expect(calls('setReferrerUrl').map(([, url]) => url)).toEqual([`${window.location.origin}/`])
  })

  it('keeps the query string out of the reported url', async () => {
    initMatomo(CONFIGURED, router)

    await router.push('/v/42/landing-page?order_code=secret-token')

    expect(calls('setCustomUrl')[1]).toEqual([
      'setCustomUrl',
      `${window.location.origin}/v/42/landing-page`
    ])
  })

  it('does not report a page view when only the query string changed', async () => {
    initMatomo(CONFIGURED, router)

    await router.push('/?step=1')
    await router.push('/?step=2')

    expect(calls('trackPageView')).toHaveLength(1)
  })

  it('runs only once', () => {
    expect(initMatomo(CONFIGURED, router)).toBe(true)
    expect(initMatomo(CONFIGURED, router)).toBe(false)

    expect(document.querySelectorAll('#matomo-tracker')).toHaveLength(1)
    expect(calls('setSiteId')).toHaveLength(1)
  })
})

describe('the backoffice', () => {
  let router: Router

  beforeEach(async () => {
    cleanDom()
    router = buildRouter()
    router.push('/backoffice/settings')
    await router.isReady()
  })

  afterEach(cleanDom)

  it('does not even load the tracker while someone is in there', () => {
    expect(initMatomo(CONFIGURED, router)).toBe(true)

    expect(tracker()).toBeNull()
    expect(window._paq).toBeUndefined()
  })

  it('reports no page views for backoffice routes', async () => {
    initMatomo(CONFIGURED, router)

    await router.push('/backoffice/vendorsummary')

    expect(tracker()).toBeNull()
  })

  it('reports no clicks either', () => {
    initMatomo(CONFIGURED, router)

    const button = document.createElement('button')

    button.textContent = 'Vendor anlegen'
    document.body.appendChild(button)
    clickOn(button)

    expect(window._paq).toBeUndefined()
  })

  it('starts tracking as soon as the visitor reaches the shop', async () => {
    initMatomo(CONFIGURED, router)

    await router.push('/v/42/landing-page')

    expect(tracker()?.src).toBe('https://matomo.example.org/matomo.js')
    expect(calls('trackPageView')).toHaveLength(1)
    // The backoffice must not turn up as the referrer of that first shop page.
    expect(calls('setReferrerUrl')).toHaveLength(0)
  })
})

describe('click tracking', () => {
  let router: Router

  beforeEach(async () => {
    cleanDom()
    router = buildRouter()
    router.push('/')
    await router.isReady()
    initMatomo(CONFIGURED, router)
  })

  afterEach(cleanDom)

  it('reports a click on a button with its label and the page', () => {
    const button = document.createElement('button')

    button.textContent = 'Zeitung kaufen'
    document.body.appendChild(button)
    clickOn(button)

    expect(calls('trackEvent')).toEqual([['trackEvent', 'Click', 'Zeitung kaufen', '/']])
  })

  it('reports a click on a child of the button as a click on the button', () => {
    document.body.innerHTML = '<button aria-label="Weiter"><span id="icon">→</span></button>'
    clickOn(document.getElementById('icon') as Element)

    expect(calls('trackEvent')).toEqual([['trackEvent', 'Click', 'Weiter', '/']])
  })

  it('ignores clicks that hit no button or link', () => {
    document.body.innerHTML = '<p id="text">Nur Text</p>'
    clickOn(document.getElementById('text') as Element)

    expect(calls('trackEvent')).toHaveLength(0)
  })

  it('tracks links as well', () => {
    document.body.innerHTML = '<a id="agb" href="https://example.org">AGB</a>'
    clickOn(document.getElementById('agb') as Element)

    expect(calls('trackEvent')).toEqual([['trackEvent', 'Click', 'AGB', '/']])
  })
})

describe('opt-out', () => {
  let router: Router

  beforeEach(async () => {
    cleanDom()
    router = buildRouter()
    router.push('/')
    await router.isReady()
  })

  afterEach(cleanDom)

  it('starts opted in', () => {
    expect(isMatomoOptedOut()).toBe(false)
  })

  it('survives a reload', () => {
    setMatomoOptOut(true)

    expect(isMatomoOptedOut()).toBe(true)
    expect(window.localStorage.getItem('matomo-opt-out')).toBe('true')
  })

  it('loads no tracker at all for an opted-out visitor', () => {
    setMatomoOptOut(true)

    expect(initMatomo(CONFIGURED, router)).toBe(false)
    expect(tracker()).toBeNull()
    expect(window._paq).toBeUndefined()
  })

  it('stops a running tracker right away', () => {
    initMatomo(CONFIGURED, router)
    setMatomoOptOut(true)

    expect(calls('optUserOut')).toHaveLength(1)
    expect(calls('disableTracking')).toHaveLength(1)
  })

  it('stops reporting clicks once opted out', () => {
    initMatomo(CONFIGURED, router)
    setMatomoOptOut(true)

    const button = document.createElement('button')

    button.textContent = 'Zeitung kaufen'
    document.body.appendChild(button)
    clickOn(button)

    expect(calls('trackEvent')).toHaveLength(0)
  })

  it('can be undone', () => {
    setMatomoOptOut(true)
    setMatomoOptOut(false)

    expect(isMatomoOptedOut()).toBe(false)
    expect(window.localStorage.getItem('matomo-opt-out')).toBeNull()
  })
})

describe('the privacy notice', () => {
  beforeEach(cleanDom)
  afterEach(cleanDom)

  it('is unseen on a first visit', () => {
    expect(isPrivacyNoticeSeen()).toBe(false)
  })

  it('stays acknowledged across reloads', () => {
    markPrivacyNoticeSeen()

    expect(isPrivacyNoticeSeen()).toBe(true)
  })

  // Acknowledging is not a consent gate — it only dismisses the banner.
  it('does not change whether the visitor is tracked', () => {
    markPrivacyNoticeSeen()

    expect(isMatomoOptedOut()).toBe(false)
  })

  it('leaves the opt-out untouched', () => {
    setMatomoOptOut(true)
    markPrivacyNoticeSeen()

    expect(isMatomoOptedOut()).toBe(true)
  })
})

describe('a router that has not resolved its first route yet', () => {
  it('counts no phantom home page view', async () => {
    cleanDom()

    const router = buildRouter()

    // No push, no isReady: the router still sits on the start location, whose path is "/".
    expect(router.currentRoute.value.path).toBe('/')
    expect(initMatomo(CONFIGURED, router)).toBe(true)
    expect(calls('trackPageView')).toHaveLength(0)

    // The real route is the first one counted, once the navigation lands.
    router.push('/v/42/landing-page')
    await router.isReady()

    expect(calls('trackPageView')).toHaveLength(1)

    expect(calls('setCustomUrl')).toEqual([
      ['setCustomUrl', `${window.location.origin}/v/42/landing-page`]
    ])

    cleanDom()
  })
})

describe('a url that must never become a script src', () => {
  beforeEach(cleanDom)
  afterEach(cleanDom)

  const router = () => {
    const r = buildRouter()

    r.push('/')

    return r
  }

  // The url comes from the backoffice. Without a scheme check a data: url would run its own
  // content in the shop's origin on every page — stored XSS against every visitor.
  it.each([
    'data:text/javascript,window.pwned = true//',
    'javascript:window.pwned = true//',
    'vbscript:msgbox(1)',
    'file:///etc/passwd'
  ])('refuses %s', async (MatomoUrl) => {
    const r = router()

    await r.isReady()

    expect(isMatomoConfigured({ MatomoUrl, MatomoSiteId: '3' })).toBe(false)
    expect(initMatomo({ MatomoUrl, MatomoSiteId: '3' }, r)).toBe(false)
    expect(tracker()).toBeNull()
    expect(window._paq).toBeUndefined()
  })

  it.each(['https://matomo.example.org/', 'http://matomo.example.org', '/matomo/'])(
    'still accepts %s',
    async (MatomoUrl) => {
      const r = router()

      await r.isReady()

      expect(isMatomoConfigured({ MatomoUrl, MatomoSiteId: '3' })).toBe(true)
      expect(initMatomo({ MatomoUrl, MatomoSiteId: '3' }, r)).toBe(true)
      expect(tracker()?.src).toMatch(/matomo\.js$/)
    }
  )

  it('does not burn the one-shot init on a rejected url', async () => {
    const r = router()

    await r.isReady()

    expect(initMatomo({ MatomoUrl: 'data:text/javascript,1', MatomoSiteId: '3' }, r)).toBe(false)
    // A corrected setting must still be able to start it.
    expect(initMatomo(CONFIGURED, r)).toBe(true)
  })
})
