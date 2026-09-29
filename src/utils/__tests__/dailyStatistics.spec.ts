import { describe, expect, it } from 'vitest'
import { buildDailyStatistics, dateRange, MAX_DAILY_SERIES } from '../dailyStatistics'

describe('dateRange', () => {
  it('lists every day up to, but excluding, an end at midnight', () => {
    expect(dateRange(new Date(2026, 8, 28), new Date(2026, 8, 30))).toEqual([
      '2026-09-28',
      '2026-09-29'
    ])
  })

  it('includes the end day when the end lies within it', () => {
    expect(dateRange(new Date(2026, 8, 28, 15), new Date(2026, 8, 29, 12))).toEqual([
      '2026-09-28',
      '2026-09-29'
    ])
  })
})

describe('buildDailyStatistics', () => {
  const names = new Map([
    [1, 'Zeitung'],
    [2, 'Kalender'],
    [3, 'transactionCosts']
  ])

  it('fills missing days with zero and ranks products by total', () => {
    const result = buildDailyStatistics(
      [
        { Date: '2026-09-28', ItemID: 2, SumQuantity: 1, SumAmount: 100 },
        { Date: '2026-09-29', ItemID: 1, SumQuantity: 5, SumAmount: 500 },
        { Date: '2026-09-29', ItemID: 3, SumQuantity: 9, SumAmount: 9 },
        { Date: '2026-10-05', ItemID: 1, SumQuantity: 7, SumAmount: 700 }
      ],
      names,
      new Date(2026, 8, 28),
      new Date(2026, 8, 30),
      { excludedIDs: [3] }
    )

    expect(result.labels).toEqual(['2026-09-28', '2026-09-29'])

    expect(result.series).toEqual([
      { key: '1', name: 'Zeitung', values: [0, 5] },
      { key: '2', name: 'Kalender', values: [1, 0] }
    ])
  })

  it('folds products beyond the palette size into "Andere"', () => {
    const many = new Map(Array.from({ length: 10 }, (_, i) => [i + 1, `P${i + 1}`]))

    const days = Array.from({ length: 10 }, (_, i) => ({
      Date: '2026-09-28',
      ItemID: i + 1,
      SumQuantity: 10 - i,
      SumAmount: 0
    }))

    const result = buildDailyStatistics(days, many, new Date(2026, 8, 28), new Date(2026, 8, 29))

    expect(result.series).toHaveLength(MAX_DAILY_SERIES)

    expect(result.series[result.series.length - 1]).toEqual({
      key: 'other',
      name: 'Andere',
      values: [3 + 2 + 1]
    })
  })

  it('sums the chosen value per day', () => {
    const result = buildDailyStatistics(
      [
        { Date: '2026-09-28', ItemID: 1, SumQuantity: 2, SumAmount: 600 },
        { Date: '2026-09-28', ItemID: 1, SumQuantity: 1, SumAmount: 300 }
      ],
      names,
      new Date(2026, 8, 28),
      new Date(2026, 8, 29),
      { value: (day) => day.SumAmount / 100 }
    )

    expect(result.series).toEqual([{ key: '1', name: 'Zeitung', values: [9] }])
  })
})
