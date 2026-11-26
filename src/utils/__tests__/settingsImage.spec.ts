import { describe, expect, it } from 'vitest'
import { logoThumbnailUrl, settingsImageUrl } from '@/utils/settingsImage'

const api = import.meta.env.VITE_API_URL.replace(/\/$/, '')

describe('settingsImageUrl', () => {
  it('keeps the version of a stored path', () => {
    expect(settingsImageUrl('/img/favicon.png?v=1a2b3c4d', '/img/x.png')).toBe(
      api + '/img/favicon.png?v=1a2b3c4d'
    )
  })

  it('adds a missing leading slash', () => {
    expect(settingsImageUrl('img/demo_logo.png', '/img/x.png')).toBe(api + '/img/demo_logo.png')
  })

  it('falls back when there is no path', () => {
    expect(settingsImageUrl(undefined, '/img/favicon.png')).toBe(api + '/img/favicon.png')
    expect(settingsImageUrl(new Blob(), '/img/favicon.png')).toBe(api + '/img/favicon.png')
  })

  it('leaves absolute URLs alone', () => {
    expect(settingsImageUrl('https://example.org/logo.png', '/img/x.png')).toBe(
      'https://example.org/logo.png'
    )
  })
})

describe('logoThumbnailUrl', () => {
  it('points to the thumbnail of the stored logo', () => {
    expect(logoThumbnailUrl('/img/logo.png?v=1a2b3c4d')).toBe(
      api + '/img/thumbs/logo.png?v=1a2b3c4d'
    )
    expect(logoThumbnailUrl('')).toBe(api + '/img/thumbs/logo.png')
  })

  it('leaves logos outside the image folder alone', () => {
    expect(logoThumbnailUrl('https://example.org/logo.png')).toBe('https://example.org/logo.png')
  })
})
