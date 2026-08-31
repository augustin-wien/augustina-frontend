import { describe, expect, it } from 'vitest'
import {
  createDefaultWorkingTime,
  normalizeWorkingTime,
  parseWorkingTime
} from '@/utils/workingTime'

describe('parseWorkingTime', () => {
  it('reads a weekday range with hours', () => {
    expect(parseWorkingTime('Mo-Fr 08:00-12:00')).toEqual({
      mode: 'by_day',
      week_days: {
        mon: [{ from: '08:00', to: '12:00' }],
        tue: [{ from: '08:00', to: '12:00' }],
        wed: [{ from: '08:00', to: '12:00' }],
        thu: [{ from: '08:00', to: '12:00' }],
        fri: [{ from: '08:00', to: '12:00' }]
      }
    })
  })

  it('reads a list of single weekdays', () => {
    expect(parseWorkingTime('Di,Do 09:00-13:00')).toEqual({
      mode: 'by_day',
      week_days: {
        tue: [{ from: '09:00', to: '13:00' }],
        thu: [{ from: '09:00', to: '13:00' }]
      }
    })
  })

  it('reads a range and single days in the same cell', () => {
    expect(parseWorkingTime('Mo-Mi,Sa 10:00-16:00')).toEqual({
      mode: 'by_day',
      week_days: {
        mon: [{ from: '10:00', to: '16:00' }],
        tue: [{ from: '10:00', to: '16:00' }],
        wed: [{ from: '10:00', to: '16:00' }],
        sat: [{ from: '10:00', to: '16:00' }]
      }
    })
  })

  it('keeps the weekdays in week order, however they were written', () => {
    const workingTime = parseWorkingTime('So,Mi,Sa 10:00-16:00')

    expect(Object.keys(workingTime.week_days ?? {})).toEqual(['wed', 'sat', 'sun'])
  })

  it('wraps a weekday range around the end of the week', () => {
    const workingTime = parseWorkingTime('Fr-Mo 12:00-20:00')

    expect(Object.keys(workingTime.week_days ?? {})).toEqual(['mon', 'fri', 'sat', 'sun'])
  })

  it('treats weekdays without hours as full days', () => {
    expect(parseWorkingTime('Sa,So')).toEqual({
      mode: 'by_day',
      week_days: { sat: [{ full_day: true }], sun: [{ full_day: true }] }
    })
  })

  it('treats the full week without hours as ganztags', () => {
    expect(parseWorkingTime('Mo-So')).toEqual({ mode: 'whole_week', whole_week: true })
  })

  it('applies hours without weekdays to every day', () => {
    expect(parseWorkingTime('09:00-17:00')).toEqual({
      mode: 'everyday',
      everyday: [{ from: '09:00', to: '17:00' }]
    })
  })

  it('pads single digit hours and accepts a dot as separator', () => {
    expect(parseWorkingTime('8.00-9.30')).toEqual({
      mode: 'everyday',
      everyday: [{ from: '08:00', to: '09:30' }]
    })
  })

  it('understands English weekday names', () => {
    expect(parseWorkingTime('Mon-Tue 08:00-12:00')).toEqual({
      mode: 'by_day',
      week_days: {
        mon: [{ from: '08:00', to: '12:00' }],
        tue: [{ from: '08:00', to: '12:00' }]
      }
    })
  })

  it('still reads the legacy letters of the old import files', () => {
    expect(parseWorkingTime('G')).toEqual({ mode: 'whole_week', whole_week: true })
    expect(parseWorkingTime('g')).toEqual({ mode: 'whole_week', whole_week: true })

    expect(parseWorkingTime('V')).toEqual({
      mode: 'everyday',
      everyday: [{ from: '08:00', to: '12:00' }]
    })

    expect(parseWorkingTime('N')).toEqual({
      mode: 'everyday',
      everyday: [{ from: '13:00', to: '17:00' }]
    })
  })

  it('falls back to the default instead of dropping an unreadable cell', () => {
    expect(parseWorkingTime('')).toEqual(createDefaultWorkingTime())
    expect(parseWorkingTime('   ')).toEqual(createDefaultWorkingTime())
    expect(parseWorkingTime('nach Absprache')).toEqual(createDefaultWorkingTime())
  })
})

describe('normalizeWorkingTime', () => {
  it('leaves an already structured working time untouched', () => {
    const stored = { mode: 'by_day', week_days: { mon: [{ from: '10:00', to: '14:00' }] } }

    expect(normalizeWorkingTime(stored)).toBe(stored)
  })

  it('defaults when there is nothing stored', () => {
    expect(normalizeWorkingTime(null)).toEqual(createDefaultWorkingTime())
    expect(normalizeWorkingTime(undefined)).toEqual(createDefaultWorkingTime())
  })
})
