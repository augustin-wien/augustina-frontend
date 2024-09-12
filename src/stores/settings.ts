import { defineStore } from 'pinia'
import { fetchSettings, patchSettings } from '@/api/api'

//define interface to store data from backend properly
export interface Settings {
  ID: number
  AGBUrl: string
  Color: string
  FontColor: string
  Logo: string
  MainItem: number
  MainItemDescription: string
  MainItemImage: string
  MainItemName: string
  MainItemPrice: number
  MaintainanceModeHelpUrl: string
  MaxOrderAmount: number
  NewspaperName: string
  OrgaCoversTransactionCosts: boolean
  QRCodeLogoImgUrl: string
  QRCodeUrl: string
  VendorNotFoundHelpUrl: string
  VendorEmailPostfix: string
  WebshopIsClosed: boolean
  MapCenterLat: number
  MapCenterLong: number
  Keycloak: {
    Realm: string
    URL: string
  } | null
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      settings: {Color:"#000"} as Settings,
      settingsLoaded: false,
      imgUrl: ''
    }
  },

  getters: {
    getSettings(state) {
      return state.settings
    }
  },

  actions: {
    async getSettingsFromApi() {
      if (this.settingsLoaded) {
        return
      }

      fetchSettings()
        .then((data) => {
          this.settings = data.data
          this.imgUrl = import.meta.env.VITE_API_URL + this.settings.Logo
          this.settingsLoaded = true
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('failed to get the settings', error)
        })
    },

    toAGB() {
      window.open(this.settings.AGBUrl, '_blank')
    },

    async updateSettings(updatedSettings: Settings) {
      try {
        this.settingsLoaded = false
        await patchSettings(updatedSettings)
        await this.getSettingsFromApi()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error updating settings:', error)
      }
    }
  }
})
