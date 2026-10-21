/**
 * Mail domains customers commonly use. An exact match is never flagged, so every real domain
 * that sits close to another one (gmx.at / gmx.de / gmx.ch) has to be listed here.
 */
const COMMON_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'gmx.at',
  'gmx.net',
  'gmx.de',
  'gmx.ch',
  'gmx.com',
  'yahoo.com',
  'yahoo.de',
  'yahoo.at',
  'hotmail.com',
  'hotmail.de',
  'hotmail.at',
  'outlook.com',
  'outlook.at',
  'outlook.de',
  'live.com',
  'live.at',
  'live.de',
  'icloud.com',
  'me.com',
  'aon.at',
  'chello.at',
  'a1.net',
  'utanet.at',
  'kabsi.at',
  'web.de',
  't-online.de',
  'posteo.at',
  'posteo.de',
  'proton.me',
  'protonmail.com',
  'tutanota.com'
]

/** Edit distance where swapping two neighbouring characters counts as one edit. */
function editDistance(a: string, b: string): number {
  const width = b.length + 1
  const d = new Array<number>((a.length + 1) * width).fill(0)
  const at = (i: number, j: number) => d[i * width + j] ?? 0

  for (let i = 0; i <= a.length; i++) {
    for (let j = 0; j <= b.length; j++) {
      if (i === 0 || j === 0) {
        d[i * width + j] = i + j
        continue
      }

      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let distance = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost)

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        distance = Math.min(distance, at(i - 2, j - 2) + 1)
      }

      d[i * width + j] = distance
    }
  }

  return at(a.length, b.length)
}

/**
 * Returns the address with a corrected domain when the domain looks like a typo of a common
 * mail domain (e.g. "max@gnail.com" -> "max@gmail.com"), otherwise null.
 */
export function suggestEmailCorrection(email: string): string | null {
  const at = (email ?? '').trim().lastIndexOf('@')
  if (at < 1) return null

  const trimmed = email.trim()
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1).toLowerCase()
  if (!domain || COMMON_DOMAINS.includes(domain)) return null

  const maxDistance = domain.length >= 8 ? 2 : 1
  let best: string | null = null
  let bestDistance = maxDistance + 1

  for (const candidate of COMMON_DOMAINS) {
    const distance = editDistance(domain, candidate)

    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }

  return best ? `${local}@${best}` : null
}
