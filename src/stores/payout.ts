import { defineStore } from 'pinia'
import { getPaymentsForPayout, postPayout } from '@/api/api'
import { type Payment } from '@/stores/payments'

export interface Payout {
  From: string | null
  To: string | null
  VendorLicenseID: string
}

export interface PaymentsForPayout {
  From: string | null
  To: string | null
  Vendor: string
}
export interface PaymentsForPayoutResponse {
  payments: Payment[]
  balance: number
}

export const usePayoutStore = defineStore('payout', {
  state: () => {
    // Define the initial state of the store
    return {
      payout: {} as Payout, // Initialize 'payout' as an empty Payout object
      paymentsForPayout: {} as PaymentsForPayoutResponse
    }
  },
  actions: {
    // Define an asynchronous action to post a payout
    async postPayout(payout: Payout) {
      return new Promise((resolve, reject) => {
        // Send a request to post the payout data to the API
        postPayout(payout)
          .then((response) => {
            this.payout = response.data
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    async getPaymentsForPayout(vendorLicenseID: string) {
      this.paymentsForPayout = {} as PaymentsForPayoutResponse

      try {
        const data = await getPaymentsForPayout({
          From: null,
          To: null,
          Vendor: vendorLicenseID
        })

        //@ts-ignore
        this.paymentsForPayout = data.data
        //@ts-ignore
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }
})
