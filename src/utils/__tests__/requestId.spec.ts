import { beforeEach, describe, expect, it, vi } from 'vitest'

const setTag = vi.fn()

vi.mock('@sentry/vue', () => ({ setTag }))

const { getLastRequestId, requestIdFromHeaders, setLastRequestId } =
  await import('@/utils/requestId')

describe('request id', () => {
  beforeEach(() => setTag.mockClear())

  it('reads the header from plain and axios-style headers', () => {
    expect(requestIdFromHeaders({ 'x-request-id': 'host/abc-000001' })).toBe('host/abc-000001')

    expect(
      requestIdFromHeaders({ get: (name: string) => (name === 'x-request-id' ? 'id-2' : null) })
    ).toBe('id-2')

    expect(requestIdFromHeaders(undefined)).toBe('')
    expect(requestIdFromHeaders({})).toBe('')
  })

  it('remembers the latest id and tags Sentry with it', () => {
    setLastRequestId('id-1')
    setLastRequestId('')

    expect(getLastRequestId()).toBe('id-1')
    expect(setTag).toHaveBeenCalledTimes(1)
    expect(setTag).toHaveBeenCalledWith('request_id', 'id-1')
  })
})
