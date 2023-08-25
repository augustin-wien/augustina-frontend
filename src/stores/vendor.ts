import { defineStore } from 'pinia'
import { fetchVendors, postVendors, patchVendor, removeVendor } from '@/api/api'

//define interface to store data from backend properly
export interface Vendor {
  Account: number
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
}

export const vendorsStore = defineStore('vendors', {
  state: () => {
    return {
      vendors: [] as Vendor[]
    }
  },

  getters: {
    getvendors(state) {
      return state.vendors
    }
  },

  actions: {
    async getVendors() {
      try {
        const data = await fetchVendors()
        this.vendors = data.data
        console.log(this.vendors)
        console.log('Vendors fetched from database')
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },

    async createVendor(newVendor: Vendor) {
      console.log(JSON.stringify(newVendor))

      postVendors(newVendor)
        .then((data) => {
          console.log('Vendor created:', data.data)
          this.getVendors()
          console.log(data)
        })
        .catch((error) => {
          console.log('Error creating vendor:', error)
        })

      //if no error: toast mit success message, if error: toast mit error message?
    },

    async updateVendor(updatedVendor: Vendor) {
      console.log(JSON.stringify(updatedVendor))
      patchVendor(updatedVendor)
        .then((data) => {
          console.log('Vendor updated:', data.data)
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error updating vendor:', error)
        })
      //if no error: toast mit success message, if error: toast mit error message?
    },
    async deleteVendor(vendorId: number) {
      removeVendor(vendorId)
        .then(() => {
          console.log('Vendor deleted:', vendorId)
          this.getVendors()
        })
        .catch((error) => {
          console.log('Error deleting vendor:', error)
        })
      //if no error: toast mit success message, if error: toast mit error message?
    }
  }
})
