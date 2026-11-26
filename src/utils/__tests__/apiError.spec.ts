import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { apiErrorMessage, errorMessage } from '@/utils/apiError'

const axiosError = (data: unknown) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() }
  } as AxiosResponse)

describe('apiErrorMessage', () => {
  it('returns the message from the backend error body', () => {
    expect(apiErrorMessage(axiosError({ error: { message: 'email taken' } }))).toBe('email taken')
  })

  it('returns the fallback when there is no backend message', () => {
    expect(apiErrorMessage(axiosError('plain text'))).toBe('')
    expect(apiErrorMessage(axiosError({ error: {} }), 'fallback')).toBe('fallback')
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
    expect(apiErrorMessage(undefined)).toBe('')
  })
})

describe('errorMessage', () => {
  it('prefers the backend message over the error message', () => {
    expect(errorMessage(axiosError({ error: { message: 'email taken' } }))).toBe('email taken')
  })

  it('falls back to the error message', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
    expect(errorMessage('not an error')).toBe('')
  })
})
