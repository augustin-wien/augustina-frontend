import { describe, expect, it } from 'vitest'
import { newsletterCsvRows } from '@/utils/newsletterCsv'
import type { Customer } from '@/stores/customer'

const customer = (overrides: Partial<Customer>): Customer => ({
  id: 1,
  keycloakid: '',
  email: '',
  firstname: '',
  lastname: '',
  licensegroups: [],
  newsletter: false,
  ...overrides
})

describe('newsletterCsvRows', () => {
  it('lists only subscribers, sorted by email, with the opt-in date', () => {
    const rows = newsletterCsvRows(
      [
        customer({
          email: 'zoe@example.com',
          newsletter: true,
          newsletter_at: '2026-10-20T16:00:00Z'
        }),
        customer({ email: 'no@example.com', newsletter: false }),
        customer({
          email: 'anna@example.com',
          firstname: 'Anna',
          lastname: 'Müller',
          newsletter: true
        })
      ],
      ['E-Mail', 'Vorname', 'Nachname', 'Angemeldet am']
    )

    expect(rows).toEqual([
      ['E-Mail', 'Vorname', 'Nachname', 'Angemeldet am'],
      ['anna@example.com', 'Anna', 'Müller', ''],
      ['zoe@example.com', '', '', '2026-10-20']
    ])
  })
})
