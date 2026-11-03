// Shortens an email to its first letters, e.g. anna@example.com -> a***@e***.com,
// so lists don't show who the customers are
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at < 0) return email ? `${email[0]}***` : ''

  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const dot = domain.lastIndexOf('.')
  const host = dot > 0 ? domain.slice(0, dot) : domain
  const tld = dot > 0 ? domain.slice(dot) : ''

  return `${local.slice(0, 1)}***@${host.slice(0, 1)}***${tld}`
}
