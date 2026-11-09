import * as Sentry from '@sentry/vue'

export type VivaFailureReason =
  | 'cancelled'
  | 'authentication'
  | 'cardDetails'
  | 'insufficientFunds'
  | 'declined'
  | 'technical'
  | 'unknown'

// EventIds from https://developer.viva.com/integration-reference/response-codes/
const reasonsByEventId: Record<number, VivaFailureReason> = {
  2061: 'cancelled',
  2062: 'authentication',
  10065: 'authentication',
  10300: 'authentication',
  10301: 'authentication',
  10012: 'cardDetails',
  10014: 'cardDetails',
  10054: 'cardDetails',
  10210: 'cardDetails',
  10051: 'insufficientFunds',
  10061: 'insufficientFunds',
  3500: 'technical',
  6614: 'technical',
  6624: 'technical',
  6650: 'technical',
  7001: 'technical',
  10019: 'technical',
  10091: 'technical',
  10096: 'technical',
  10199: 'technical',
  10200: 'technical',
  10401: 'technical'
}

const isIssuerResponse = (eventId: number) =>
  (eventId >= 10000 && eventId < 11000) || (eventId >= 300 && eventId < 400) || eventId === 2101

export function vivaFailureReason(eventId: string | null | undefined): VivaFailureReason {
  if (!eventId || !/^\d+$/.test(eventId)) {
    return 'unknown'
  }

  const id = Number(eventId)

  if (reasonsByEventId[id]) {
    return reasonsByEventId[id]
  }

  return isIssuerResponse(id) ? 'declined' : 'unknown'
}

export interface VivaFailure {
  orderCode: string
  eventId: string
  eci: string
}

export function reportVivaFailure(failure: VivaFailure) {
  const reason = vivaFailureReason(failure.eventId)

  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'payment_failed')
    scope.setTag('payment_event_id', failure.eventId || 'none')
    scope.setTag('payment_failure_reason', reason)
    scope.setContext('payment', { ...failure, reason })
    scope.setFingerprint(['payment_failed', failure.eventId || 'none'])
    Sentry.captureMessage(
      `Payment failed at VivaWallet (EventId ${failure.eventId || 'none'})`,
      'warning'
    )
  })
}
