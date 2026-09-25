import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportAsCsv } from '@/utils/utils'

describe('exportAsCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Capture the CSV text the download link would carry
  const exported = (data: unknown[][]) => {
    let href = ''

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      href = this.href
    })

    exportAsCsv(data, 'test')

    return decodeURIComponent(href.replace('data:text/csv;charset=utf-8,', ''))
  }

  it('joins cells with semicolons', () => {
    expect(exported([['a', 1, null]])).toBe('a;1;\n')
  })

  it('quotes cells that contain separators, quotes or line breaks', () => {
    expect(exported([['Hauptstraße 1; Ecke Gasse', 'sagt "Hallo"', 'Zeile\nzwei']])).toBe(
      '"Hauptstraße 1; Ecke Gasse";"sagt ""Hallo""";"Zeile\nzwei"\n'
    )
  })
})
