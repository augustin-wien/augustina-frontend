import { defineStore } from 'pinia'
import { fetchSettings, patchSettings } from '@/api/api'

//define interface to store data from backend properly
export interface Settings {
  color: string
  id: number
  logo: string
  mainItem: number
  refundFees: boolean
}

export const settingsStore = defineStore('settings', {
  state: () => {
    return {
      settings: [] as Settings[]
    }
  },

  getters: {
    getSettings(state) {
      return state.settings
    }
  },

  actions: {
    async getSettings() {
      try {
        const data = await fetchSettings()
        this.settings = data.data
      } catch (error) {
        console.log(error)
      }
    },

    async updateSettings(updatedSettings: Settings) {
      try {
        await patchSettings(updatedSettings)
        await this.getSettings()
      } catch (error) {
        console.log('Error updating settings:', error)
      }
    }
  }
})
