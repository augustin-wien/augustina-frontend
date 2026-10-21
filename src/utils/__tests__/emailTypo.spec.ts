import { describe, expect, it } from 'vitest'
import { suggestEmailCorrection } from '../emailTypo'

describe('suggestEmailCorrection', () => {
  it('corrects typos of common domains', () => {
    expect(suggestEmailCorrection('max@gnail.com')).toBe('max@gmail.com')
    expect(suggestEmailCorrection('max@gmial.com')).toBe('max@gmail.com')
    expect(suggestEmailCorrection('max@gmail.con')).toBe('max@gmail.com')
    expect(suggestEmailCorrection('max@hotmal.com')).toBe('max@hotmail.com')
    expect(suggestEmailCorrection('max@gmx.ar')).toBe('max@gmx.at')
  })

  it('keeps the local part as typed', () => {
    expect(suggestEmailCorrection(' Max.Muster@GNAIL.com ')).toBe('Max.Muster@gmail.com')
  })

  it('leaves common domains alone', () => {
    expect(suggestEmailCorrection('max@gmail.com')).toBeNull()
    expect(suggestEmailCorrection('max@GMX.de')).toBeNull()
    expect(suggestEmailCorrection('max@a1.net')).toBeNull()
  })

  it('leaves unrelated domains alone', () => {
    expect(suggestEmailCorrection('max@augustin.or.at')).toBeNull()
    expect(suggestEmailCorrection('max@example.com')).toBeNull()
    expect(suggestEmailCorrection('max@web.at')).toBeNull()
  })

  it('ignores input that is not an address yet', () => {
    expect(suggestEmailCorrection('')).toBeNull()
    expect(suggestEmailCorrection('gmail.com')).toBeNull()
    expect(suggestEmailCorrection('max@')).toBeNull()
  })
})
