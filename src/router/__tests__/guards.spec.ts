import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import keycloak from '@/keycloak/keycloak'
import { installBackend, on } from '@/__tests__/support/backend'
import { signIn } from '@/__tests__/support/mount'
import { useSettingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'

const go = async (path: string) => {
  await router.push(path).catch(() => {})
  return router.currentRoute.value
}

beforeEach(async () => {
  setActivePinia(createPinia())
  installBackend()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  signIn(['backoffice'])
  await go('/404')
})

describe('router guards', () => {
  it('sends a vendor away from the backoffice to their own page', async () => {
    signIn(['vendor'])

    expect((await go('/backoffice/credits')).name).toBe('My Info')
  })

  it('sends the backoffice away from the vendor pages', async () => {
    signIn(['admin'])

    expect((await go('/me/profile')).name).toBe('Vendor Summary')
  })

  it('reads the roles from the realm access as well', async () => {
    signIn([])

    keycloak.keycloak = {
      ...keycloak.keycloak,
      authenticated: true,
      tokenParsed: { realm_access: { roles: ['vendor'] } }
    } as never

    expect((await go('/me')).name).toBe('My Info')
    expect((await go('/dashboard')).name).toBe('Dashboard')
  })

  it('sends users without role to the online paper', async () => {
    const replace = vi.fn()
    vi.stubGlobal('location', { ...window.location, replace })
    signIn(['customer'])

    await go('/backoffice/credits')
    expect(replace).toHaveBeenCalledWith('https://example.org/paper')

    await go('/me')
    expect(replace).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
  })

  it('sends users without role home when there is no online paper', async () => {
    signIn(['customer'])
    const store = useSettingsStore()
    store.settingsLoaded = true
    store.settings.OnlinePaperUrl = ''

    expect((await go('/dashboard')).name).toBe('Home')
  })

  it('aborts protected routes for anonymous users', async () => {
    signIn([])

    expect((await go('/backoffice/credits')).name).toBe('404')
  })

  it('initialises keycloak on the first protected route and flags an unreachable backend', async () => {
    keycloak.initailizedKeycloak = false
    keycloak.keycloak = undefined
    on('get', /api\/settings\/$/, 'down', 502)

    await go('/backoffice/credits')

    expect(useSettingsStore().backendUnreachable).toBe(true)
  })

  it('collapses repeated slashes', async () => {
    expect((await go('/backoffice//credits')).path).toBe('/backoffice/credits')
  })

  it('skips the donation page when donations are switched off', async () => {
    const store = useSettingsStore()
    store.settingsLoaded = true
    store.settings.DonationPageEnabled = false

    expect((await go('/v/AUG-1/tipping')).name).toBe('Confirmation')
    expect(useShopStore().donation).toBe(0)
  })

  it('sets the page title from the newspaper name and the route', async () => {
    const store = useSettingsStore()

    store.settings.NewspaperName = undefined as never
    await go('/error')
    expect(document.title).toBe('Augustina')

    store.settings.NewspaperName = 'Augustin'
    await go('/backoffice/credits')
    expect(document.title).toMatch(/^Augustin/)
  })
})
