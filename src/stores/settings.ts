import { defineStore } from 'pinia'
import {
  fetchSettings,
  fetchAdminSettings,
  patchSettings,
  patchSettingsStyles,
  getStyles
} from '@/api/api'

// Shared in-flight request so concurrent callers await the same fetch instead
// of racing (or resolving before the settings are actually loaded).
let inflightSettingsRequest: Promise<void> | null = null

//define interface to store data from backend properly
export interface Settings {
  ID: number
  AGBUrl: string
  Color: string
  FontColor: string
  Favicon: string | File | undefined
  Logo: string | File | undefined
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
  QRCodeSettings: string
  QRCodeEnableLogo: boolean
  VendorNotFoundHelpUrl: string
  VendorEmailPostfix: string
  WebshopIsClosed: boolean
  MapCenterLat: number
  MapCenterLong: number
  UseVendorLicenseIdInShop: boolean
  UseTipInsteadOfDonation: boolean
  ShopLanding: boolean | undefined
  DigitalItemsUrl: string
  AbonementUrl: string
  AbonementEnabled: boolean
  POSEnabled: boolean
  WordPressInviteURL: string
  WordPressInviteAPIKey: string
  WordPressInviteTTL: number
  PrivacyPolicyUrl: string
  MatomoUrl: string
  MatomoSiteId: string
  edges?: any
  Keycloak: {
    Realm: string
    URL: string
  } | null
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      settings: { Color: '#000', ShopLanding: undefined } as Settings,
      settingsLoaded: false,
      isLoading: false,
      imgUrl: '',
      styleRev: 0,
      styleCurrent: -1,
      styles: ''
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

      // A load is already running: await the same request so callers only
      // resolve once the settings are actually populated.
      if (inflightSettingsRequest) {
        return inflightSettingsRequest
      }

      this.isLoading = true

      inflightSettingsRequest = fetchSettings()
        .then((data) => {
          this.settings = data.data.Settings
          this.settings.Keycloak = data.data.Keycloak
          this.settings.MainItem = data.data.Settings.Edges.MainItem.id
          this.settings.MainItemDescription = data.data.Settings.Edges.MainItem.Description
          this.settings.MainItemImage = data.data.Settings.Edges.MainItem.Image
          this.settings.MainItemName = data.data.Settings.Edges.MainItem.Name
          this.settings.MainItemPrice = data.data.Settings.Edges.MainItem.Price
          this.imgUrl = import.meta.env.VITE_API_URL + this.settings.Logo
          this.settingsLoaded = true
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('failed to get the settings', error)
        })
        .finally(() => {
          this.isLoading = false
          inflightSettingsRequest = null
        })

      return inflightSettingsRequest
    },

    /**
     * Loads the settings including the fields the public endpoint withholds. Only the backoffice
     * settings page needs this — and it has to run before saving, because patchSettings sends
     * every field back and would otherwise overwrite the credentials with empty strings.
     */
    async getAdminSettingsFromApi() {
      try {
        const data = await fetchAdminSettings()

        this.settings = { ...this.settings, ...data.data.Settings }
        this.settings.Keycloak = data.data.Keycloak
        this.settings.MainItem = data.data.Settings.edges.MainItem.id
        this.settings.MainItemDescription = data.data.Settings.edges.MainItem.Description
        this.settings.MainItemImage = data.data.Settings.edges.MainItem.Image
        this.settings.MainItemName = data.data.Settings.edges.MainItem.Name
        this.settings.MainItemPrice = data.data.Settings.edges.MainItem.Price
        this.settingsLoaded = true

        return true
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('failed to get the admin settings', error)

        return false
      }
    },

    // Both urls come from the backoffice settings. Opening them unchecked would run a
    // "javascript:" url in this origin, and a plain _blank leaves the opened page a handle on
    // window.opener.
    openExternalUrl(url: string) {
      if (!url) return

      let parsed: URL

      try {
        parsed = new URL(url, window.location.origin)
      } catch {
        return
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return

      window.open(parsed.href, '_blank', 'noopener,noreferrer')
    },

    toAGB() {
      this.openExternalUrl(this.settings.AGBUrl)
    },

    toPrivacyPolicy() {
      this.openExternalUrl(this.settings.PrivacyPolicyUrl)
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
    },
    async updateStyleCss(style: string) {
      try {
        this.styleRev++
        await patchSettingsStyles(style)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error updating style:', error)
      }
    },
    async getStyleCss() {
      try {
        if (this.styleCurrent === this.styleRev) {
          return
        }

        this.styleCurrent = this.styleRev

        getStyles(this.styleRev).then((data) => {
          this.styles = data.data
        })
        // this.styles = await response.text
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error getting style:', error)
      }
    }
  }
})
