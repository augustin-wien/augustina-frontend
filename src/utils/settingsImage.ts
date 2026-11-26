const apiBase = () => import.meta.env.VITE_API_URL.replace(/\/$/, '')

// Absolute URL of an image path from the settings (e.g. "/img/logo.png?v=1a2b3c4d"). A value
// that is not a path yet, such as a File picked in the settings form, falls back to fallback.
export function settingsImageUrl(path: unknown, fallback: string): string {
  const value = typeof path === 'string' && path !== '' ? path : fallback

  if (/^https?:\/\//.test(value)) return value

  return apiBase() + (value.startsWith('/') ? value : '/' + value)
}

// URL of the logo's thumbnail. Uploaded logos are often thousands of pixels wide, while the
// layouts show them at a height of a few dozen pixels.
export function logoThumbnailUrl(logo: unknown): string {
  const url = settingsImageUrl(logo, '/img/logo.png')
  const base = apiBase()

  if (!url.startsWith(base + '/img/')) return url

  return base + '/img/thumbs/' + url.slice((base + '/img/').length)
}
