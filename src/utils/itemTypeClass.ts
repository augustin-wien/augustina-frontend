export function itemTypeClass(type: string | null | undefined): string {
  return type ? `item-type-${type}` : ''
}
