import { defineStore } from 'pinia'
import { postPayout } from '@/api/api'

export interface Payout {
  Amount: number
  VendorLicenseID: any
}

export const payoutStore = defineStore('payout', {
  state: () => {
    // Define the initial state of the store
    return {
      payout: {} as Payout // Initialize 'payout' as an empty Payout object
    }
  },
  actions: {
    // Define an asynchronous action to post a payout
    async postPayout(payout: Payout) {
      try {
        // Send a request to post the payout data to the API
        console.log(payout)

        const data = await postPayout(payout)
        // Update the 'payout' state with the response data
        //@ts-ignore
        this.payout = data.data
        //@ts-ignore
      } catch (error) {
        // Handle any errors that occur during the API request
        console.log(error)
      }
    }
  }
})
