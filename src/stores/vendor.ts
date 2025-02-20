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
  getVendorMe,
  patchVendorLocation,
  postVendorLocation,
  deleteVendorLocation,
  fetchVendorLocations,
  fetchVendorComments,
  postVendorComment,
  patchVendorComment,
  deleteVendorComment
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
  Language: string
  Comments: VendorComment[]
  Locations: VendorLocation[]
  Telephone: string
  RegistrationDate: string
  VendorSince: string
  OnlineMap: boolean
  HasSmartphone: boolean
  HasBankAccount: boolean
  Debt: string

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

export interface VendorLocation {
  id: number
  name: string
  address: string
  longitude: number
  latitude: number
  zip: string
  working_time: string
}

export interface VendorComment {
  id: number
  vendorid: number
  comment: string
  warning: boolean
  resolved_at: Date | null
  created_at: Date
}

export interface VendorCheckResponse {
  name: string
}

type VendorStoreState = {
  vendors: Vendor[]
  vendorsImportedCount: number
  filteredVendors: Vendor[]
  vendor: Vendor | null
  vendorLocations: VendorLocation[] | null
  vendorComments: VendorComment[] | null
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
    },
    async updateVendorLocation(updatedLocation: VendorLocation, vendorId: number) {
      try {
        await patchVendorLocation(vendorId, updatedLocation.id, updatedLocation)
        await fetchVendorLocations(vendorId).then((response) => {
          this.vendorLocations = response.data
          return
        })
      } catch (error) {
        return error
      }
    },
    async createVendorLocation(newLocation: VendorLocation, vendorId: number) {
      try {
        await postVendorLocation(vendorId, newLocation)
        await fetchVendorLocations(vendorId).then((response) => {
          this.vendorLocations = response.data
          return
        })
      } catch (error) {
        return error
      }
    },
    async deleteVendorLocation(vendorId: number, locationId: number) {
      try {
        await deleteVendorLocation(vendorId, locationId)
        await fetchVendorLocations(vendorId).then((response) => {
          this.vendorLocations = response.data
        })
        return
      } catch (error) {
        return error
      }
    },
    async getVendorLocations(vendorId: number) {
      try {
        await fetchVendorLocations(vendorId).then((response) => {
          this.vendorLocations = response.data
        })

        return
      } catch (error) {
        return error
      }
    },
    async getVendorComments(vendorId: number) {
      try {
        await fetchVendorComments(vendorId).then((response) => {
          this.vendorComments = response.data
        })

        return
      } catch (error) {
        return error
      }
    },
    async createVendorComment(newComment: VendorComment, vendorId: number) {
      try {
        await postVendorComment(vendorId, newComment)
        return
      } catch (error) {
        return error
      }
    },
    async updateVendorComment(updatedComment: VendorComment, vendorId: number) {
      try {
        await patchVendorComment(vendorId, updatedComment.id, updatedComment)
        return
      } catch (error) {
        return error
      }
    },
    async deleteVendorComment(vendorId: number, commentId: number) {
      try {
        await deleteVendorComment(vendorId, commentId)
        await fetchVendorComments(vendorId).then((response) => {
          this.vendorComments = response.data
        })
        return
      } catch (error) {
        return error
      }
    }
  }
})
