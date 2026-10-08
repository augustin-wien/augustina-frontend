/**
 * Normalizes the VendorEmailPostfix setting, or returns null if it can't make a valid address.
 * It is appended to the license ID as-is and may carry more than the domain
 * (e.g. "-@example.com"); a bare domain gets an "@". Mirrors normalizeVendorEmailPostfix in
 * the backend, which rejects such a setting on save.
 */
export function normalizeVendorEmailPostfix(postfix: string): string | null {
  let domain = (postfix ?? '').trim().toLowerCase()
  if (!domain.includes('@')) domain = '@' + domain
  if (domain.split('@').length !== 2 || domain.endsWith('@') || /\s/.test(domain)) return null
  return domain
}

/**
 * The address a vendor without a mailbox of their own gets: the license ID followed by the
 * VendorEmailPostfix setting. Mirrors internalVendorEmail in the backend, which is what
 * actually assigns it - this is only the preview shown in the form.
 */
export function internalVendorEmail(licenseId: string, postfix: string): string {
  const domain = normalizeVendorEmailPostfix(postfix)
  if (domain === null) return ''

  const local = (licenseId ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')

  return local ? local + domain : ''
}
