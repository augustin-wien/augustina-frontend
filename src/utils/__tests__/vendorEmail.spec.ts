import { describe, expect, it } from 'vitest'
import { internalVendorEmail } from '../vendorEmail'

describe('internalVendorEmail', () => {
  it('joins the license ID and the postfix', () => {
    expect(internalVendorEmail('AB123', '@augustin.or.at')).toBe('ab123@augustin.or.at')
  })

  it('adds a missing @ to the postfix', () => {
    expect(internalVendorEmail('ab123', 'augustin.or.at')).toBe('ab123@augustin.or.at')
  })

  it('replaces characters an email address cannot contain', () => {
    expect(internalVendorEmail(' Intern 1/ä ', '@example.com')).toBe('intern-1--@example.com')
  })

  it('is empty without a license ID or postfix', () => {
    expect(internalVendorEmail('', '@example.com')).toBe('')
    expect(internalVendorEmail('ab123', '')).toBe('')
    expect(internalVendorEmail('ab123', '@')).toBe('')
  })
})
