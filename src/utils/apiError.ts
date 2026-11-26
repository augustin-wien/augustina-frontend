import axios from 'axios'

/**
 * The message the backend put into an error response ({ error: { message } }), or the fallback
 * when the request failed without one.
 */
export function apiErrorMessage(error: unknown, fallback = ''): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message

    if (typeof message === 'string') return message
  }

  return fallback
}

/** The backend message, else the error's own message. */
export function errorMessage(error: unknown): string {
  return apiErrorMessage(error, error instanceof Error ? error.message : '')
}
