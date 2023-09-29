import { defineStore } from 'pinia'
import { fetchPayments } from '@/api/api'

export interface Payments {
  Amount: number
  AuthorizedBy: string
  Id: number
  Order: number
  OrderEntry: number
  Receiver: number
  Sender: number
  Timestamp: '00:00:00'
}

export const usePaymentStore = defineStore('payments', {
  state: () => {
    return {
      payments: [] as Payments[]
    }
  },
  getters: {
    paymentsList(state: any) {
      return state.payments
    }
  },

  actions: {
    async getPayments(startDate: string, endDate: string) {
      try {
        const data = await fetchPayments(startDate, endDate)
        //@ts-ignore
        this.payments = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    }
  }
})
