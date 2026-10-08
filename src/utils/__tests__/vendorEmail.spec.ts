import { describe, expect, it } from 'vitest'
import { internalVendorEmail, normalizeVendorEmailPostfix } from '../vendorEmail'

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

  it('appends a postfix that carries more than the domain as-is', () => {
    expect(internalVendorEmail('824', '-@example.com')).toBe('824-@example.com')
    expect(internalVendorEmail('824', '-vendor@Example.com')).toBe('824-vendor@example.com')
  })

  it('returns an empty string for a postfix with more than one @', () => {
    expect(internalVendorEmail('824', 'a@b@example.com')).toBe('')
  })
})

describe('normalizeVendorEmailPostfix', () => {
  it('accepts a domain with or without @, and a postfix with more than the domain', () => {
    expect(normalizeVendorEmailPostfix(' @Example.com ')).toBe('@example.com')
    expect(normalizeVendorEmailPostfix('example.com')).toBe('@example.com')
    expect(normalizeVendorEmailPostfix('-@example.com')).toBe('-@example.com')
  })

  it('rejects a postfix that cannot make a valid address', () => {
    for (const postfix of ['', '@', '-@', 'a@b@example.com', '@exa mple.com']) {
      expect(normalizeVendorEmailPostfix(postfix)).toBeNull()
    }
  })
})
