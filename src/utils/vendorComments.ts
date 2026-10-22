import type { VendorComment } from '@/stores/vendor'

// The backend sends the zero time ("0001-01-01...") for comments that were never resolved
export function isSetDate(date: string | Date | null | undefined): boolean {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime()) && d.getFullYear() > 1
}

export function isOpenWarning(comment: VendorComment): boolean {
  return comment.warning && !isSetDate(comment.resolved_at)
}
