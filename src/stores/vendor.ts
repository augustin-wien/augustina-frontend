import agent from '@/api/agent'
import { defineStore } from 'pinia'
import {
  getVendor,
  fetchVendors,
  postVendors,
  patchVendor,
  removeVendor,
  checkVendorId
} from '@/api/api'
import router from '@/router'

export const useVendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: '',
      vendorName: ''
    }
  },
  actions: {
    async checkID(vendorId: string | string[] | undefined) {
      if (!vendorId) {
        router.push({ name: 'Go to Vendor' })
        return
      }
      agent.Vendor.checkID(vendorId)
        .then((response) => {
          this.vendorName = response.FirstName
          this.vendorid = typeof vendorId == 'string' ? vendorId : vendorId[0]
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
  Email: string
  FirstName: string
  ID: number
  KeycloakID: string
  LastName: string
  LastPayout: {
    infinityModifier: number
    time: string
    valid: true
  } | null
  LicenseID: string
  UrlID: string
  Balance: number
  IsDisabled: boolean
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
}

export interface VendorCheckResponse {
  name: string
}

export const vendorsStore = defineStore('vendors', {
  state: () => {
    return {
      vendors: [] as Vendor[],
      vendorsImportedCount: Number,
      filteredVendors: [] as Vendor[],
      vendor: {} as Vendor
    }
  },

  getters: {
    getvendors(state: any) {
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
        console.log(error)
      }
    },

    async createVendor(newVendor: Vendor) {
      postVendors(newVendor)
        .then(() => {
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error creating vendor:', error)
        })
    },
    async createVendorPromise(newVendor: Vendor) {
      return postVendors(newVendor)
    },

    async createVendors(vendors: Array<Vendor>) {
      for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i];
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
      console.log(searchTerm)
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
      patchVendor(updatedVendor)
        .then(() => {
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error updating vendor:', error)
        })
    },
    async deleteVendor(vendorId: number) {
      removeVendor(vendorId)
        .then(() => {
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error deleting vendor:', error)
        })
    },
    async getVendor(vendorId: number) {
      try {
        const data = await getVendor(vendorId)
        this.vendor = data.data
        return data.data
      } catch (error) {
        console.log(error)
      }
    }
  }
})
