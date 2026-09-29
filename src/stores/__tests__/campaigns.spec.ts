import { describe, expect, it } from 'vitest'
import { campaignStatus, type CampaignInput } from '../campaigns'

const base: CampaignInput = {
  name: 'Test',
  item_id: 1,
  title: '',
  text: '',
  starts_at: null,
  ends_at: null,
  enabled: true
}

describe('campaignStatus', () => {
  const now = new Date('2026-09-29T12:00:00Z')

  it('is off when disabled, whatever the period', () => {
    expect(campaignStatus({ ...base, enabled: false }, now)).toBe('off')
  })

  it('runs without a period', () => {
    expect(campaignStatus(base, now)).toBe('running')
  })

  it('is scheduled before the start and ended after the end', () => {
    expect(campaignStatus({ ...base, starts_at: '2026-09-30T00:00:00Z' }, now)).toBe('scheduled')
    expect(campaignStatus({ ...base, ends_at: '2026-09-29T12:00:00Z' }, now)).toBe('ended')
  })

  it('runs within the period', () => {
    expect(
      campaignStatus(
        { ...base, starts_at: '2026-09-29T00:00:00Z', ends_at: '2026-09-30T00:00:00Z' },
        now
      )
    ).toBe('running')
  })
})
