import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiInstance } from '@/api/api'

// Named separately from the `scope` variable below - inlining this as `typeof scope`
// on withScope's parameter makes the vi.hoisted callback's return type reference
// itself (scope's own type would depend on the object that contains it).
interface MockScope {
  setTag: ReturnType<typeof vi.fn>
  setContext: ReturnType<typeof vi.fn>
}

// vi.mock is hoisted above every import in this file, so the mock functions it
// references have to be created through vi.hoisted rather than plain consts.
const { scope, captureException, withScope, updateToken, login } = vi.hoisted(() => {
  const scope: MockScope = { setTag: vi.fn(), setContext: vi.fn() }

  return {
    scope,
    captureException: vi.fn(),
    withScope: vi.fn((callback: (scope: MockScope) => void) => callback(scope)),
    updateToken: vi.fn(),
    login: vi.fn()
  }
})

// vi.spyOn can't touch a real ESM module's frozen namespace, so the module
// itself is replaced - api.ts's `import * as Sentry` resolves to this.
vi.mock('@sentry/vue', () => ({ captureException, withScope }))

// Same reasoning as the Sentry mock above - api.ts's `import keycloak from
// '@/keycloak/keycloak'` resolves to this instead of the real singleton.
vi.mock('@/keycloak/keycloak', () => ({
  default: {
    keycloak: { authenticated: true, token: 'stale-token', updateToken, login }
  }
}))

describe('apiInstance', () => {
  afterEach(() => {
    captureException.mockClear()
    withScope.mockClear()
    scope.setTag.mockClear()
    scope.setContext.mockClear()
    updateToken.mockReset()
    login.mockClear()
  })

  // Port 1 is reserved and nothing listens there, so this is a real network
  // failure - the same axios error shape (no error.response) a visitor gets
  // when the backend is down, not a mocked one.
  it('reports a backend-unreachable error to Sentry, tagged so it stands out from a normal 4xx/5xx', async () => {
    const error = await apiInstance.get('http://127.0.0.1:1/').catch((e) => e)

    expect(error.response).toBeUndefined()
    expect(scope.setTag).toHaveBeenCalledWith('error_type', 'backend_unreachable')
    expect(captureException).toHaveBeenCalledWith(error)
  })

  // A real 4xx/5xx has error.response and must not be misreported as the
  // backend being unreachable.
  it('does not tag a normal HTTP error response as backend-unreachable', async () => {
    await expect(
      apiInstance.get('http://127.0.0.1:1/', { adapter: notFoundAdapter })
    ).rejects.toMatchObject({ response: { status: 404 } })

    expect(captureException).not.toHaveBeenCalled()
  })

  // The common case: the access token merely expired mid-session. A single retry with a
  // refreshed token should resolve transparently, not reject and not redirect to login.
  it('retries once with a refreshed token after a 401, resolving without a login redirect', async () => {
    updateToken.mockResolvedValueOnce(true)

    let calls = 0

    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      calls += 1

      if (calls === 1) {
        throw Object.assign(new Error('Request failed with status code 401'), {
          config,
          response: { status: 401, statusText: 'Unauthorized', headers: {}, config, data: {} },
          isAxiosError: true
        })
      }

      return { status: 200, statusText: 'OK', headers: {}, config, data: { ok: true } }
    }

    const response = await apiInstance.get('http://127.0.0.1:1/', { adapter })

    expect(response.data).toEqual({ ok: true })
    expect(calls).toBe(2)
    expect(updateToken).toHaveBeenCalledWith(-1)
    expect(login).not.toHaveBeenCalled()
  })

  // The refresh itself failing (session genuinely gone, not just an expired access token)
  // is the one case that should still fall back to a login redirect.
  it('falls back to a login redirect when the token refresh fails after a 401', async () => {
    updateToken.mockRejectedValueOnce(new Error('refresh failed'))

    await expect(
      apiInstance.get('http://127.0.0.1:1/', { adapter: unauthorizedAdapter })
    ).rejects.toMatchObject({ response: { status: 401 } })

    expect(login).toHaveBeenCalledTimes(1)
  })
})

// Minimal axios adapter stub returning a 404, to exercise the "has a response" branch
// without needing a real server that answers with one. Always throws, so nothing ever
// actually returns an AxiosResponse - the return type still has to say so, since an
// adapter that only ever throws infers as Promise<void> otherwise.
const notFoundAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const error = Object.assign(new Error('Request failed with status code 404'), {
    config,
    response: { status: 404, statusText: 'Not Found', headers: {}, config, data: {} },
    isAxiosError: true
  })

  throw error
}

// Same shape as notFoundAdapter, for the 401 case - always throws.
const unauthorizedAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const error = Object.assign(new Error('Request failed with status code 401'), {
    config,
    response: { status: 401, statusText: 'Unauthorized', headers: {}, config, data: {} },
    isAxiosError: true
  })

  throw error
}
