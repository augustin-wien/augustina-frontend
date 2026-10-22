import { describe, expect, it } from 'vitest'
import { licenseIdFromScan } from '../idCardScan'

describe('licenseIdFromScan', () => {
  it('reads the license ID from the shop link in the QR code', () => {
    expect(licenseIdFromScan('https://augustina.cc/v/AB123')).toBe('AB123')
    expect(licenseIdFromScan('https://augustina.cc/v/AB123/')).toBe('AB123')
    expect(licenseIdFromScan('https://augustina.cc/v/AB123?utm=card#top')).toBe('AB123')
  })

  it('uses the last /v/ segment when the configured URL has a path', () => {
    expect(licenseIdFromScan('https://example.org/v/shop/v/AB123')).toBe('AB123')
  })

  it('decodes license IDs with spaces', () => {
    expect(licenseIdFromScan('https://augustina.cc/v/Intern%201')).toBe('Intern 1')
    expect(licenseIdFromScan('https://augustina.cc/v/Intern 1')).toBe('Intern 1')
  })

  it('keeps a broken escape as it is', () => {
    expect(licenseIdFromScan('https://augustina.cc/v/AB%ZZ')).toBe('AB%ZZ')
  })

  it('takes plain input as the license ID', () => {
    expect(licenseIdFromScan('  AB123 \n')).toBe('AB123')
    expect(licenseIdFromScan('')).toBe('')
  })
})
