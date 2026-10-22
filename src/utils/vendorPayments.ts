import type { Payment } from '@/stores/payments'

/**
 * The vendor's own account in a list of the vendor's payments, to tell money in from money out.
 * The account is named after the license ID when the vendor is created; if the license ID was
 * changed since, it is the one account every payment has on one side.
 */
export function vendorAccountId(payments: Payment[], licenseId: string): number | undefined {
  for (const p of payments) {
    if (p.SenderName === licenseId) return p.Sender
    if (p.ReceiverName === licenseId) return p.Receiver
  }

  const [first, ...rest] = payments
  if (!first) return undefined

  const candidates = [...new Set([first.Sender, first.Receiver])].filter((id) =>
    rest.every((p) => p.Sender === id || p.Receiver === id)
  )

  return candidates.length === 1 ? candidates[0] : undefined
}
