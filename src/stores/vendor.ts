import { defineStore } from 'pinia'
import { fetchVendors, postVendors, patchVendor, removeVendor } from '@/api/api'

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
}

export const vendorsStore = defineStore('vendors', {
  state: () => {
    return {
      vendors: [] as Vendor[]
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
        .then((data) => {
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error creating vendor:', error)
        })
    },

    async createVendors(vendors: Array<Vendor>) {
      vendors.forEach((vendor: Vendor) => {
        if (vendor !== null) {
          postVendors(vendor)
        }
      });

    },

    async updateVendor(updatedVendor: Vendor) {
      patchVendor(updatedVendor)
        .then((data) => {
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
    }

  }
})
