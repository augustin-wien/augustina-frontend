import { describe, expect, it } from 'vitest'
import type { Payment } from '@/stores/payments'
import { vendorAccountId } from '../vendorPayments'

const payment = (sender: [number, string], receiver: [number, string]) =>
  ({
    Sender: sender[0],
    SenderName: sender[1],
    Receiver: receiver[0],
    ReceiverName: receiver[1]
  }) as Payment

describe('vendorAccountId', () => {
  it('finds the account named after the license ID', () => {
    const payments = [payment([1, 'Orga'], [7, 'AB123'])]
    expect(vendorAccountId(payments, 'AB123')).toBe(7)
  })

  it('finds the account on the sending side', () => {
    const payments = [payment([7, 'AB123'], [2, 'Cash'])]
    expect(vendorAccountId(payments, 'AB123')).toBe(7)
  })

  it('falls back to the account every payment shares after a license ID change', () => {
    const payments = [payment([1, 'Orga'], [7, 'OLD1']), payment([7, 'OLD1'], [2, 'Cash'])]
    expect(vendorAccountId(payments, 'NEW1')).toBe(7)
  })

  it('gives up when the account is ambiguous', () => {
    expect(vendorAccountId([payment([1, 'Orga'], [7, 'OLD1'])], 'NEW1')).toBeUndefined()
    expect(vendorAccountId([], 'AB123')).toBeUndefined()
  })
})
