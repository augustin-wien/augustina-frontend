import type { Customer } from '@/stores/customer'

export type NewsletterCsvHeader = [
  email: string,
  firstName: string,
  lastName: string,
  since: string
]

// Rows of the newsletter subscriber export, header first
export function newsletterCsvRows(customers: Customer[], header: NewsletterCsvHeader): string[][] {
  const rows = customers
    .filter((c) => c.newsletter)
    .sort((a, b) => a.email.localeCompare(b.email))
    .map((c) => [c.email, c.firstname, c.lastname, (c.newsletter_at ?? '').slice(0, 10)])

  return [[...header], ...rows]
}
