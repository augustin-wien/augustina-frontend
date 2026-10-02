/**
 * The address a vendor without a mailbox of their own gets: the license ID followed by the
 * VendorEmailPostfix setting. Mirrors internalVendorEmail in the backend, which is what
 * actually assigns it - this is only the preview shown in the form.
 */
export function internalVendorEmail(licenseId: string, postfix: string): string {
  let domain = (postfix ?? '').trim().toLowerCase()
  if (domain === '' || domain === '@') return ''
  if (!domain.startsWith('@')) domain = '@' + domain

  const local = (licenseId ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')

  return local ? local + domain : ''
}
