export interface TimeRange {
  from?: string
  to?: string
  full_day?: boolean
}

export interface WorkingTime {
  mode?: string
  everyday?: TimeRange[]
  week_days?: { [key: string]: TimeRange[] }
  whole_week?: boolean
}

/** Weekday keys as the backend stores them, in week order, with the spellings accepted for each. */
const DAY_ALIASES: { [day: string]: string[] } = {
  mon: ['mo', 'mon', 'montag', 'monday'],
  tue: ['di', 'tue', 'dienstag', 'tuesday'],
  wed: ['mi', 'wed', 'mittwoch', 'wednesday'],
  thu: ['do', 'thu', 'donnerstag', 'thursday'],
  fri: ['fr', 'fri', 'freitag', 'friday'],
  sat: ['sa', 'sat', 'samstag', 'saturday'],
  sun: ['so', 'sun', 'sonntag', 'sunday']
}

const WEEK_DAYS = Object.keys(DAY_ALIASES)

const dayKey = (name: string): string | undefined =>
  WEEK_DAYS.find((day) => DAY_ALIASES[day]?.includes(name))

/** "08:00-12:00", "8.00 - 12.00", "08:00 – 12:00" */
const TIME_RANGE = /(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/

export const createDefaultWorkingTime = (): WorkingTime => ({
  mode: 'everyday',
  everyday: [{ from: '09:00', to: '17:00' }]
})

const wholeWeek = (): WorkingTime => ({ mode: 'whole_week', whole_week: true })

const everyday = (from: string, to: string): WorkingTime => ({
  mode: 'everyday',
  everyday: [{ from, to }]
})

const readTimeRange = (value: string): TimeRange | null => {
  const match = TIME_RANGE.exec(value)

  if (!match) return null

  const [, fromHour, fromMinute, toHour, toMinute] = match

  return {
    from: `${(fromHour ?? '').padStart(2, '0')}:${fromMinute}`,
    to: `${(toHour ?? '').padStart(2, '0')}:${toMinute}`
  }
}

/** Expands "mon" through "fri" — wrapping around the end of the week, so "fri-mon" works too. */
const expandDayRange = (start: string, end: string): string[] => {
  const first = WEEK_DAYS.indexOf(start)
  const last = WEEK_DAYS.indexOf(end)
  const days: string[] = []

  for (let i = 0; i < WEEK_DAYS.length; i++) {
    const day = WEEK_DAYS[(first + i) % WEEK_DAYS.length]

    if (day) days.push(day)
    if ((first + i) % WEEK_DAYS.length === last) break
  }

  return days
}

/** Reads "Mo-Fr", "Di,Do" or "Mo-Mi,Sa" — the time range, if any, is ignored here. */
const readDays = (value: string): string[] => {
  const days: string[] = []

  for (const part of value.replace(TIME_RANGE, ' ').split(/[,+/]/)) {
    const [start, end] = part.split(/[-–]/).map((day) => dayKey(day.trim().toLowerCase()))

    if (!start) continue

    for (const day of end ? expandDayRange(start, end) : [start]) {
      if (!days.includes(day)) days.push(day)
    }
  }

  return days
}

/**
 * Reads a working time as written in the vendor import CSV. Accepted:
 *
 * - `Mo-Fr 08:00-12:00`, `Di,Do 09:00-13:00`, `Mo-Mi,Sa 10:00-16:00` — those days, those hours
 * - `Mo-Fr` — those days, all day
 * - `08:00-12:00` — every day, those hours
 * - `Mo-So`, `ganztags`, and the legacy letters `G` / `V` / `N`
 *
 * Anything unreadable falls back to the same default the address dialog uses, so a typo costs the
 * opening hours but never the vendor.
 */
export const parseWorkingTime = (value: string): WorkingTime => {
  const text = value.trim()
  const lower = text.toLowerCase()

  if (lower === '') return createDefaultWorkingTime()
  if (lower === 'g' || lower === 'ganztags') return wholeWeek()

  if (lower === 'v' || lower === 'vormittag' || lower === 'vormittags') {
    return everyday('08:00', '12:00')
  }

  if (lower === 'n' || lower === 'nachmittag' || lower === 'nachmittags') {
    return everyday('13:00', '17:00')
  }

  const range = readTimeRange(text)
  const days = readDays(text)

  if (days.length === 0) {
    return range ? { mode: 'everyday', everyday: [range] } : createDefaultWorkingTime()
  }

  // Every day of the week, all day long — that is what "ganztags" means.
  if (!range && days.length === WEEK_DAYS.length) return wholeWeek()

  const week_days: { [day: string]: TimeRange[] } = {}

  for (const day of WEEK_DAYS) {
    if (days.includes(day)) week_days[day] = [range ?? { full_day: true }]
  }

  return { mode: 'by_day', week_days }
}

/** Keeps structured working times as they are and reads written ones. */
export const normalizeWorkingTime = (
  workingTime: string | WorkingTime | null | undefined
): WorkingTime => {
  if (!workingTime) return createDefaultWorkingTime()
  if (typeof workingTime === 'string') return parseWorkingTime(workingTime)

  return workingTime
}

/**
 * One-line summary of a location's working time, e.g. "Täglich: 08:00-12:00" or
 * "Mo: 09:00-17:00 · Di: geschlossen". Also understands the legacy v/n/g codes.
 */
export const formatWorkingTimeSummary = (
  workingTime: WorkingTime | string | null | undefined,
  t: (key: string) => string
): string => {
  if (!workingTime) return t('noLocations')

  if (typeof workingTime === 'string') {
    switch (workingTime.toLowerCase()) {
      case 'v':
        return `${t('everyday')}: 08:00 - 12:00`
      case 'n':
        return `${t('everyday')}: 13:00 - 17:00`
      case 'g':
        return t('open 24/7')
      default:
        return workingTime
    }
  }

  const formatRange = (range: TimeRange) =>
    range.full_day ? t('full day') : `${range.from}-${range.to}`

  const mode = workingTime.mode
  if (mode === 'whole_week') return t('open 24/7')

  if (mode === 'everyday' && workingTime.everyday) {
    const times = workingTime.everyday
    if (times.length === 0) return t('closed')
    if (times[0]?.full_day) return t('full day')
    return `${t('everyday')}: ${times.map(formatRange).join(', ')}`
  }

  if (mode === 'by_day' && workingTime.week_days) {
    const weekDays = workingTime.week_days
    return WEEK_DAYS.filter((day) => weekDays[day])
      .map((day) => {
        const ranges = weekDays[day] || []

        if (ranges.length === 0) {
          return `${t(day)}: ${t('closed')}`
        }

        return `${t(day)}: ${ranges.map(formatRange).join(', ')}`
      })
      .join(' · ')
  }

  return mode || t('workingTime')
}
