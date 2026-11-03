import { describe, expect, it } from 'vitest'
import { maskEmail } from '@/utils/maskEmail'

describe('maskEmail', () => {
  it('keeps the first letters and the top-level domain', () => {
    expect(maskEmail('anna.mueller@example.com')).toBe('a***@e***.com')
    expect(maskEmail('max@mail.example.at')).toBe('m***@m***.at')
  })

  it('handles addresses without a domain dot or an @', () => {
    expect(maskEmail('anna@localhost')).toBe('a***@l***')
    expect(maskEmail('anna')).toBe('a***')
    expect(maskEmail('')).toBe('')
  })
})
