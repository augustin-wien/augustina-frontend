import type { Router } from 'vue-router'

const reloadKey = 'staleChunkReloadAt'
const reloadInterval = 10_000

const staleChunkMessages = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Unable to preload'
]

export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return staleChunkMessages.some((part) => message.includes(part))
}

// Reloads the page once so the browser fetches the current index.html and its chunks.
// Returns false when a reload already happened within the last few seconds.
export function reloadForStaleChunk(path?: string): boolean {
  const last = Number(sessionStorage.getItem(reloadKey) ?? 0)

  if (Date.now() - last < reloadInterval) {
    return false
  }

  sessionStorage.setItem(reloadKey, String(Date.now()))

  if (path && path !== window.location.pathname + window.location.search) {
    window.location.assign(path)
  } else {
    window.location.reload()
  }

  return true
}

export function handleStaleChunks(router: Router) {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForStaleChunk()) {
      event.preventDefault()
    }
  })

  router.onError((error, to) => {
    if (isStaleChunkError(error)) {
      reloadForStaleChunk(to.fullPath)
    }
  })
}
