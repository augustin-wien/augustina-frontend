import * as Sentry from '@sentry/vue'

let lastRequestId = ''

/** Reads the backend's X-Request-Id from a response's headers. */
export function requestIdFromHeaders(headers: unknown): string {
  if (!headers || typeof headers !== 'object') return ''

  const h = headers as Record<string, unknown> & { get?: (name: string) => unknown }
  const value = typeof h.get === 'function' ? h.get('x-request-id') : h['x-request-id']

  return typeof value === 'string' ? value : ''
}

/**
 * Remembers the id of the latest backend response and tags every following Sentry event with it,
 * so an error in the shop can be matched to the backend logs of the request that preceded it.
 */
export function setLastRequestId(id: string): void {
  if (!id) return

  lastRequestId = id
  Sentry.setTag('request_id', id)
}

export function getLastRequestId(): string {
  return lastRequestId
}
