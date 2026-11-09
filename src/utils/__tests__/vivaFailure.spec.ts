import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportVivaFailure, vivaFailureReason } from '@/utils/vivaFailure'

const { scope, captureMessage, withScope } = vi.hoisted(() => {
  const scope = { setTag: vi.fn(), setContext: vi.fn(), setFingerprint: vi.fn() }

  return {
    scope,
    captureMessage: vi.fn(),
    withScope: vi.fn((callback: (s: typeof scope) => void) => callback(scope))
  }
})

vi.mock('@sentry/vue', () => ({ captureMessage, withScope }))

describe('vivaFailureReason', () => {
  it.each([
    ['2061', 'cancelled'],
    ['2062', 'authentication'],
    ['10301', 'authentication'],
    ['10054', 'cardDetails'],
    ['10210', 'cardDetails'],
    ['10051', 'insufficientFunds'],
    ['10005', 'declined'],
    ['10062', 'declined'],
    ['304', 'declined'],
    ['7001', 'technical'],
    ['10096', 'technical']
  ])('maps EventId %s to %s', (eventId, reason) => {
    expect(vivaFailureReason(eventId)).toBe(reason)
  })

  it.each([undefined, null, '', '0', '12005', 'abc', '10005x'])(
    'returns unknown for %s',
    (eventId) => {
      expect(vivaFailureReason(eventId)).toBe('unknown')
    }
  )
})

describe('reportVivaFailure', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends a warning tagged with the EventId and reason', () => {
    reportVivaFailure({ orderCode: '1234567890123456', eventId: '10051', eci: '5' })

    expect(scope.setTag).toHaveBeenCalledWith('error_type', 'payment_failed')
    expect(scope.setTag).toHaveBeenCalledWith('payment_event_id', '10051')
    expect(scope.setTag).toHaveBeenCalledWith('payment_failure_reason', 'insufficientFunds')

    expect(scope.setContext).toHaveBeenCalledWith('payment', {
      orderCode: '1234567890123456',
      eventId: '10051',
      eci: '5',
      reason: 'insufficientFunds'
    })

    expect(captureMessage).toHaveBeenCalledWith(
      'Payment failed at VivaWallet (EventId 10051)',
      'warning'
    )
  })

  it('groups reports without an EventId under none', () => {
    reportVivaFailure({ orderCode: '1', eventId: '', eci: '' })

    expect(scope.setFingerprint).toHaveBeenCalledWith(['payment_failed', 'none'])
  })
})
