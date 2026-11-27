import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const client = vi.hoisted(() => ({
  instances: [] as Array<Record<string, unknown>>
}))

vi.mock('keycloak-js', () => ({
  default: vi.fn(function (this: Record<string, unknown>, config: unknown) {
    Object.assign(this, {
      config,
      authenticated: false,
      init: vi.fn().mockResolvedValue(true),
      login: vi.fn(),
      logout: vi.fn(),
      updateToken: vi.fn().mockResolvedValue(true)
    })

    client.instances.push(this)
  })
}))

const load = async () => {
  vi.resetModules()
  const module = await import('@/keycloak/keycloak')
  const { installBackend: reinstall } = await import('@/__tests__/support/backend')
  reinstall()
  return module
}

beforeEach(() => {
  client.instances.length = 0
  setActivePinia(createPinia())
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('initKeycloak', () => {
  it('creates the client from the backend settings and checks the session', async () => {
    const { default: keycloak, initKeycloak } = await load()

    await initKeycloak()

    const instance = client.instances[0] as Record<string, ReturnType<typeof vi.fn> & unknown> & {
      config: unknown
    }

    expect(instance.config).toEqual({
      url: 'https://sso.example.org',
      realm: 'augustin',
      clientId: 'frontend'
    })

    expect(instance.init).toHaveBeenCalledWith({
      onLoad: 'check-sso',
      redirectUri: expect.any(String)
    })

    expect(keycloak.initailizedKeycloak).toBe(true)

    await initKeycloak()
    expect(client.instances).toHaveLength(1)
  })

  it('logs in when not authenticated and on a token that cannot be refreshed', async () => {
    const { default: keycloak, initKeycloak, logout } = await load()
    await initKeycloak()

    const kc = keycloak.keycloak as unknown as Record<string, (...args: unknown[]) => unknown> & {
      login: ReturnType<typeof vi.fn>
      logout: ReturnType<typeof vi.fn>
      updateToken: ReturnType<typeof vi.fn>
    }

    kc.onReady(false)
    expect(kc.login).toHaveBeenCalledTimes(1)
    kc.onReady(true)
    expect(kc.login).toHaveBeenCalledTimes(1)

    kc.updateToken.mockRejectedValueOnce(new Error('expired'))
    kc.onTokenExpired()
    await new Promise((r) => setTimeout(r, 0))
    expect(kc.login).toHaveBeenCalledTimes(2)

    kc.onTokenExpired()
    await new Promise((r) => setTimeout(r, 0))
    expect(kc.updateToken).toHaveBeenCalledWith(100)

    kc.onAuthError()
    kc.onAuthRefreshSuccess()
    kc.onAuthRefreshError()
    kc.onAuthLogout()
    expect(kc.logout).toHaveBeenCalledTimes(1)

    logout()
    expect(kc.logout.mock.calls[1][0].redirectUri).toBe(`${window.location.origin}/`)
  })

  it('does nothing without settings', async () => {
    const { default: keycloak, initKeycloak } = await load()
    const { on } = await import('@/__tests__/support/backend')
    on('get', /api\/settings\/$/, null)

    await initKeycloak()

    expect(keycloak.keycloak).toBeUndefined()
  })

  it('fails when the settings cannot be loaded', async () => {
    const { initKeycloak } = await load()
    const { fail: failAgain } = await import('@/__tests__/support/backend')
    failAgain('get', /api\/settings\/$/, 502)

    await expect(initKeycloak()).rejects.toBeTruthy()
  })
})
