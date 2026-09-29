import type { DailyItemStatistics } from '@/stores/statistics'

export type DailySeries = {
  key: string
  name: string
  values: number[]
}

export type DailyStatistics = {
  labels: string[] // YYYY-MM-DD
  series: DailySeries[]
}

// Beyond this many products the smallest ones are folded into "Andere", so every
// line keeps a distinct color from the fixed categorical palette.
export const MAX_DAILY_SERIES = 8

const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Every calendar day in [start, end). The backend filters payments with timestamp <= end,
// so an end at local midnight contributes no day of its own.
export const dateRange = (start: Date, end: Date): string[] => {
  const days: string[] = []
  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)

  while (cursor < end) {
    days.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export type DailyStatisticsOptions = {
  excludedIDs?: number[]
  maxSeries?: number
  // What a day contributes to its product's line, e.g. quantity or amount in euro
  value?: (day: DailyItemStatistics) => number
}

export const buildDailyStatistics = (
  days: DailyItemStatistics[],
  itemNames: Map<number, string>,
  start: Date,
  end: Date,
  {
    excludedIDs = [],
    maxSeries = MAX_DAILY_SERIES,
    value = (day) => day.SumQuantity
  }: DailyStatisticsOptions = {}
): DailyStatistics => {
  const labels = dateRange(start, end)
  const dayIndex = new Map(labels.map((label, i) => [label, i]))

  const perItem = new Map<number, number[]>()

  for (const day of days) {
    const name = itemNames.get(day.ItemID)
    const i = dayIndex.get(day.Date)

    if (i === undefined || name === undefined || excludedIDs.includes(day.ItemID)) {
      continue
    }

    const values = perItem.get(day.ItemID) ?? labels.map(() => 0)
    values[i] = (values[i] ?? 0) + value(day)
    perItem.set(day.ItemID, values)
  }

  const total = (values: number[]) => values.reduce((a, b) => a + b, 0)

  const ranked = [...perItem.entries()]
    .map(([id, values]) => ({ key: String(id), name: itemNames.get(id) ?? '', values }))
    .sort((a, b) => total(b.values) - total(a.values) || a.name.localeCompare(b.name))

  if (ranked.length <= maxSeries) {
    return { labels, series: ranked }
  }

  const kept = ranked.slice(0, maxSeries - 1)

  const other = labels.map((_, i) =>
    ranked.slice(maxSeries - 1).reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
  )

  return { labels, series: [...kept, { key: 'other', name: 'Andere', values: other }] }
}
