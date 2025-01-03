import agent from '@/api/agent'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import {
  getVendor,
  fetchVendors,
  postVendors,
  patchVendor,
  removeVendor,
  checkVendorId,
  getVendorMe
} from '@/api/api'
import router from '@/router'

export const useVendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: '',
      vendorName: '',
      vendorLink: ''
    }
  },
  actions: {
    async checkID(vendorId: string | string[] | undefined) {
      if (useRoute().name === 'Go to Vendor' || useRoute().name === 'Error') {
        // we are already on one of the pages we want to check for
        return
      }

      if (!vendorId) {
        router.push({ name: 'Go to Vendor' })
        return
      }

      agent.Vendor.checkID(vendorId)
        .then((response) => {
          if (!response.FirstName) {
            // we got an bad answer from the backend
            router.push({ name: 'Error' })
            return
          }

          this.vendorName = response.FirstName
          this.vendorid = typeof vendorId == 'string' ? vendorId : vendorId[0]
          this.vendorLink = response.AccountProofUrl

          if (this.vendorName !== '') {
            router.push(`/v/${vendorId}/landing-page`)
          }
        })
        .catch(() => {
          router.push({ name: 'Go to Vendor' })
        })
    }
  }
})

//define interface to store data from backend properly
export interface Vendor {
  ID: number
  AccountProofUrl: string | null
  Email: string
  FirstName: string
  KeycloakID: string
  LastName: string
  LastPayout: string | null
  LicenseID: string
  UrlID: string
  Balance: number
  IsDisabled: boolean
  IsDeleted: boolean
  Longitude: number
  Latitude: number
  Address: string
  PLZ: string
  Location: string
  WorkingTime: string
  Language: string
  Comment: string
  Telephone: string
  RegistrationDate: string
  VendorSince: string
  OnlineMap: boolean
  HasSmartphone: boolean
  HasBankAccount: boolean

  OpenPayments:
    | [
        {
          Amount: number
          AuthorizedBy: string
          Id: number
          IsPayoutFor: string[]
          IsSale: boolean
          Item: number
          Order: number
          OrderEntry: number
          Payout: number
          Price: number
          Quantity: number
          Receiver: number
          ReceiverName: string
          Sender: number
          SenderName: string
          Timestamp: string
        }
      ]
    | null
}

export interface VendorCheckResponse {
  name: string
}

type VendorStoreState = {
  vendors: Vendor[]
  vendorsImportedCount: number
  filteredVendors: Vendor[]
  vendor: Vendor | null
}

export const vendorsStore = defineStore('vendors', {
  state: () => {
    return {
      vendors: [] as Vendor[],
      vendorsImportedCount: 0,
      filteredVendors: [] as Vendor[],
      vendor: null as Vendor | null
    } as VendorStoreState
  },

  getters: {
    getvendors(state: VendorStoreState) {
      return state.vendors
    }
  },

  actions: {
    async getVendors() {
      try {
        const data = await fetchVendors()
        //@ts-ignore
        this.vendors = data.data
        //@ts-ignore
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },

    async createVendor(newVendor: Vendor) {
      postVendors(newVendor)
        .then(() => {
          this.getVendors()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error creating vendor:', error)
        })
    },
    async createVendorPromise(newVendor: Vendor) {
      return postVendors(newVendor)
    },

    async createVendors(vendors: Array<Vendor>) {
      for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i]

        if (vendor !== null) {
          if (
            vendor.LicenseID === '' ||
            vendor.LicenseID === null ||
            vendor.LicenseID === undefined
          ) {
            return null
          }

          this.vendorsImportedCount = i + 1
          const vendorCheck = await checkVendorId(vendor.LicenseID)

          if (vendorCheck === null) {
            await this.createVendorPromise(vendor)
          }
        }
      }
    },
    async searchVendors(searchTerm: string) {
      if (searchTerm === '') {
        this.filteredVendors = this.vendors
      } else {
        this.filteredVendors = this.vendors.filter((vendor: Vendor) => {
          return (
            vendor.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.LicenseID.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })
      }
    },

    async updateVendor(updatedVendor: Vendor) {
      try {
        await patchVendor(updatedVendor)
        this.getVendors()
        return
      } catch (error) {
        return error
      }
    },
    async deleteVendor(vendorId: number) {
      removeVendor(vendorId)
        .then(() => {
          this.getVendors()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error deleting vendor:', error)
        })
    },
    async getVendor(vendorId: number) {
      try {
        const data = await getVendor(vendorId)
        this.vendor = data.data
        return data.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },

    async fetchVendorMe() {
      getVendorMe()
        .then((response) => {
          // @ts-ignore
          this.vendor = response.data
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
    }
  }
})
