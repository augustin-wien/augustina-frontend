import { describe, expect, it } from 'vitest'
import { getSentry, registerSentry, sentryConfigured } from '@/utils/sentry'

describe('sentryConfigured', () => {
  it.each([
    ['https://key@glitchtip.example.org/3', true],
    ['http://key@localhost:8000/1', true],
    ['', false],
    ['VITE_SENTRY_DSN_value', false]
  ])('%s -> %s', (dsn, expected) => {
    expect(sentryConfigured(dsn)).toBe(expected)
  })
})

describe('registerSentry', () => {
  it('makes the loaded module available', () => {
    expect(getSentry()).toBeUndefined()

    const module = { setTag: () => {} } as unknown as Parameters<typeof registerSentry>[0]
    registerSentry(module)
    expect(getSentry()).toBe(module)

    registerSentry(undefined)
    expect(getSentry()).toBeUndefined()
  })
})
