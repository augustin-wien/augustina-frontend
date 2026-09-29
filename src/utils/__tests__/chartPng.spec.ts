import { describe, expect, it } from 'vitest'
import { chartPngFilename } from '../chartPng'

describe('chartPngFilename', () => {
  it('builds an ASCII file name from title and period', () => {
    expect(chartPngFilename('Top 10 Verkäufer:innen (Einnahmen)', '24.09.2026 – 26.09.2026')).toBe(
      'statistik_top_10_verkaeufer_innen_einnahmen_24_09_2026_26_09_2026.png'
    )
  })
})
