import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isStaleChunkError, reloadForStaleChunk } from '@/utils/staleChunk'

describe('isStaleChunkError', () => {
  it('recognises chunk load failures from the different browsers', () => {
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true)

    expect(
      isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: /assets/a.js'))
    ).toBe(true)

    expect(isStaleChunkError(new TypeError('error loading dynamically imported module'))).toBe(true)

    expect(isStaleChunkError(new Error('Unable to preload CSS for /assets/a.css'))).toBe(true)
  })

  it('ignores other errors', () => {
    expect(isStaleChunkError(new Error('Network Error'))).toBe(false)
    expect(isStaleChunkError(undefined)).toBe(false)
  })
})

describe('reloadForStaleChunk', () => {
  const reload = vi.fn()
  const assign = vi.fn()

  beforeEach(() => {
    sessionStorage.clear()

    vi.stubGlobal('location', {
      pathname: '/shop',
      search: '',
      reload,
      assign
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    reload.mockReset()
    assign.mockReset()
  })

  it('reloads the current page', () => {
    expect(reloadForStaleChunk()).toBe(true)
    expect(reload).toHaveBeenCalledOnce()
  })

  it('navigates to the target route', () => {
    expect(reloadForStaleChunk('/payment')).toBe(true)
    expect(assign).toHaveBeenCalledWith('/payment')
  })

  it('does not reload again right after a reload', () => {
    reloadForStaleChunk()
    expect(reloadForStaleChunk()).toBe(false)
    expect(reload).toHaveBeenCalledOnce()
  })
})
