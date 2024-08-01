import { defineStore } from 'pinia'
import { fetchPayments } from '@/api/api'

export interface Payment {
  Amount: number
  AuthorizedBy: string
  ID: number
  Order: number
  OrderEntry: number
  Receiver: number
  ReceiverName: string
  Sender: number
  SenderName: string
  Timestamp: '00:00:00'
  Item: number
  Quantity: number
  Price: number
  Payout: boolean
  IsPayoutFor: Array<Payment>
}

export const usePaymentsStore = defineStore('payments', {
  state: () => {
    return {
      payments: [] as Payment[]
    }
  },
  getters: {
    paymentsList(state: any) {
      return state.payments
    }
  },

  actions: {
    async getPayments(startDate: Date, endDate: Date) {
      try {
        const data = await fetchPayments(startDate, endDate, '')
        //@ts-ignore
        this.payments = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    },
    async getPayouts(startDate: Date, endDate: Date) {
      try {
        const data = await fetchPayments(startDate, endDate, 'payouts=true')
        //@ts-ignore
        this.payments = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    },
    async getSales(startDate: Date, endDate: Date) {
      try {
        const data = await fetchPayments(startDate, endDate, 'sales=true')
        //@ts-ignore
        this.payments = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    }
  }
})
