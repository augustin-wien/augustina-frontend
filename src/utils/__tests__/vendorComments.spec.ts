import { describe, expect, it } from 'vitest'
import { isOpenWarning, isSetDate } from '../vendorComments'
import type { VendorComment } from '@/stores/vendor'

const comment = (warning: boolean, resolved: string | null): VendorComment =>
  ({
    id: 1,
    vendorid: 1,
    comment: 'x',
    warning,
    resolved_at: resolved as unknown as Date,
    created_at: new Date()
  }) as VendorComment

describe('isSetDate', () => {
  it('treats the zero time from the backend as not set', () => {
    expect(isSetDate('0001-01-01T00:00:00Z')).toBe(false)
    expect(isSetDate(null)).toBe(false)
    expect(isSetDate('2026-10-01T10:00:00Z')).toBe(true)
  })
})

describe('isOpenWarning', () => {
  it('is only true for unresolved warnings', () => {
    expect(isOpenWarning(comment(true, '0001-01-01T00:00:00Z'))).toBe(true)
    expect(isOpenWarning(comment(true, '2026-10-01T10:00:00Z'))).toBe(false)
    expect(isOpenWarning(comment(false, null))).toBe(false)
  })
})
