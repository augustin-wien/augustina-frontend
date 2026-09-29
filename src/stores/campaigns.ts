import { defineStore } from 'pinia'
import {
  deleteCampaign,
  fetchActiveCampaigns,
  fetchCampaigns,
  postCampaign,
  putCampaign,
  trackCampaign
} from '@/api/api'

export interface CampaignInput {
  name: string
  item_id: number
  title: string
  text: string
  // ISO timestamps, null when that side of the period is open
  starts_at: string | null
  ends_at: string | null
  enabled: boolean
}

export interface Campaign extends CampaignInput {
  id: number
  views: number
  clicks: number
  created_at: string
}

// What the shop gets from the public endpoint
export interface ActiveCampaign {
  id: number
  item_id: number
  title: string
  text: string
  starts_at: string | null
  ends_at: string | null
}

export type CampaignStatus = 'off' | 'scheduled' | 'running' | 'ended'

export const campaignStatus = (c: CampaignInput, now = new Date()): CampaignStatus => {
  if (!c.enabled) return 'off'

  if (c.starts_at && new Date(c.starts_at) > now) return 'scheduled'

  if (c.ends_at && new Date(c.ends_at) <= now) return 'ended'

  return 'running'
}

export const toCampaignInput = (c: Campaign): CampaignInput => ({
  name: c.name,
  item_id: c.item_id,
  title: c.title,
  text: c.text,
  starts_at: c.starts_at,
  ends_at: c.ends_at,
  enabled: c.enabled
})

// The landing page and the shop page both mount the popup; share one request between them.
let activePromise: Promise<ActiveCampaign[]> | null = null

export const useCampaignsStore = defineStore('campaigns', {
  state: () => ({
    campaigns: [] as Campaign[],
    // Set once a campaign popup was shown in this visit, so a customer never gets two in a row
    popupShown: false
  }),

  actions: {
    async getCampaigns() {
      const res = await fetchCampaigns()
      this.campaigns = res.data ?? []
    },

    async createCampaign(campaign: CampaignInput) {
      await postCampaign(campaign)
      await this.getCampaigns()
    },

    async updateCampaign(id: number, campaign: CampaignInput) {
      const res = await putCampaign(id, campaign)
      const index = this.campaigns.findIndex((c) => c.id === id)

      if (index >= 0) this.campaigns[index] = res.data
    },

    async removeCampaign(id: number) {
      await deleteCampaign(id)
      this.campaigns = this.campaigns.filter((c) => c.id !== id)
    },

    getActiveCampaigns() {
      if (!activePromise) {
        activePromise = fetchActiveCampaigns()
          .then((res) => (res.data ?? []) as ActiveCampaign[])
          .catch(() => {
            // A campaign is never worth breaking the shop for
            activePromise = null
            return []
          })
      }

      return activePromise
    },

    track(id: number, counter: 'view' | 'click') {
      trackCampaign(id, counter).catch(() => {
        // Losing a count is fine, bothering the customer about it is not
      })
    }
  }
})
