import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiInstance } from '@/api/api'
import { useSettingsStore } from '@/stores/settings'

function responseError(status?: number) {
  const response = status
    ? ({ status, data: {}, headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse)
    : undefined

  return new AxiosError('failed', undefined, undefined, undefined, response)
}

describe('useSettingsStore.getSettingsFromApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it.each([
    ['there is no response', undefined],
    ['the proxy reports a bad gateway', 502],
    ['the proxy reports the service unavailable', 503],
    ['the proxy times out', 504]
  ])('flags the backend as unreachable when %s', async (_, status) => {
    vi.spyOn(apiInstance, 'get').mockRejectedValue(responseError(status))

    const store = useSettingsStore()
    await store.getSettingsFromApi()

    expect(store.backendUnreachable).toBe(true)
  })

  it('does not flag an error the backend answered with itself', async () => {
    vi.spyOn(apiInstance, 'get').mockRejectedValue(responseError(500))

    const store = useSettingsStore()
    await store.getSettingsFromApi()

    expect(store.backendUnreachable).toBe(false)
  })
})
