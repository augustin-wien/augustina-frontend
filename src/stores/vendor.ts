import axios from 'axios'
import { defineStore } from 'pinia'

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
  }
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
    getVendors(state) {
      return state.vendors
    }
  },

  actions: {
    async fetchVendors() {
      try {
        const data = await axios.get<Vendor[]>('http://localhost:3000/api/vendors/')
        this.vendors = data.data
        console.log(this.vendors)
        console.log('Vendors fetched from database')
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
    async createVendor(newVendor: Vendor) {
      try {
        const response = await axios.post('http://localhost:3000/api/vendors/', newVendor, {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })

        console.log('Vendor created:', response.data)
        this.fetchVendors()
      } catch (error) {
        alert(error)
        console.error('Error creating vendor:', error)
      }
    },
    async updateVendor(updatedVendor: Vendor) {
      try {
        const response = await axios.put(
          `http://localhost:3000/api/vendors/${updatedVendor.ID}`,
          updatedVendor,
          {
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('Vendor updated:', response.data)
        this.fetchVendors()
      } catch (error) {
        alert(error)
        console.error('Error updating vendor:', error)
      }
    },
    async deleteVendor(vendorId: number) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/vendors/${vendorId}`)

        console.log('Vendor deleted:', response.data)
        this.fetchVendors()
      } catch (error) {
        alert(error)
        console.error('Error deleting vendor:', error)
      }
    }
  }
})
