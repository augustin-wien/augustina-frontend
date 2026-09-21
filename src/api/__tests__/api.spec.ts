import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiInstance } from '@/api/api'

// vi.mock is hoisted above every import in this file, so the mock functions it
// references have to be created through vi.hoisted rather than plain consts.
const { scope, captureException, withScope } = vi.hoisted(() => {
  const scope = { setTag: vi.fn(), setContext: vi.fn() }

  return {
    scope,
    captureException: vi.fn(),
    withScope: vi.fn((callback: (scope: typeof scope) => void) => callback(scope))
  }
})

// vi.spyOn can't touch a real ESM module's frozen namespace, so the module
// itself is replaced - api.ts's `import * as Sentry` resolves to this.
vi.mock('@sentry/vue', () => ({ captureException, withScope }))

describe('apiInstance', () => {
  afterEach(() => {
    captureException.mockClear()
    withScope.mockClear()
    scope.setTag.mockClear()
    scope.setContext.mockClear()
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
})

// Minimal axios adapter stub returning a 404, to exercise the "has a response" branch
// without needing a real server that answers with one.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notFoundAdapter(config: any) {
  const error: any = new Error('Request failed with status code 404')

  error.config = config
  error.response = { status: 404, statusText: 'Not Found', headers: {}, config, data: {} }
  error.isAxiosError = true
  throw error
}
