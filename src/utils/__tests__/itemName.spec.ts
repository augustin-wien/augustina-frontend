import { describe, expect, it } from 'vitest'
import { itemDisplayName } from '../itemName'

const t = (key: string) => `t:${key}`

describe('itemDisplayName', () => {
  it('translates donations and transaction costs by their type', () => {
    expect(itemDisplayName({ Name: 'donation', Type: 'donation' }, t)).toBe('t:itemType_donation')

    expect(itemDisplayName({ Name: 'transactionCosts', Type: 'transaction_costs' }, t)).toBe(
      't:itemType_transaction_costs'
    )
  })

  it('keeps the name of other items', () => {
    expect(itemDisplayName({ Name: 'Zeitung', Type: 'issue' }, t)).toBe('Zeitung')
    expect(itemDisplayName({ Name: 'Zeitung' }, t)).toBe('Zeitung')
  })
})
