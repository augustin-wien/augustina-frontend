// Donations and transaction costs carry internal names (e.g. "donation", "transactionCosts"),
// so they are shown by their translated type instead
const SYSTEM_ITEM_TYPES = ['donation', 'transaction_costs']

export function itemDisplayName(
  item: { Name: string; Type?: string },
  t: (key: string) => string
): string {
  if (item.Type && SYSTEM_ITEM_TYPES.includes(item.Type)) return t(`itemType_${item.Type}`)
  return item.Name
}
