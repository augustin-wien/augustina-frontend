import { defineStore } from 'pinia'
import { fetchUnverifiedOrders } from '@/api/api'
import agent from '@/api/agent'

export interface OrderEntry {
  ID: number
  Item: number
  Quantity: number
  Price: number
  Sender: number
  Receiver: number
  SenderName: string
  ReceiverName: string
  IsSale: boolean
}

export interface Order {
  ID: number
  OrderCode: string | null
  TransactionID: string
  Timestamp: string
  VerifiedAt: string | null
  Vendor: number
  CustomerEmail: string | null
  OdooSyncedAt: string | null
  OdooSyncError: string | null
  ReconcileFailedAt?: string | null
  ReconcileError?: string | null
  PaymentEventID?: number | null
  PaymentFailedAt?: string | null
  Entries: OrderEntry[] | null
}

export const useOrdersStore = defineStore('orders', {
  state: () => {
    return {
      unverifiedOrders: [] as Order[]
    }
  },
  actions: {
    async getUnverifiedOrders() {
      try {
        const response = await fetchUnverifiedOrders()
        this.unverifiedOrders = response.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },
    async verifyAdminPayment(orderCode: string) {
      try {
        await agent.VivaWallet.verifyAdminPayment(orderCode)
        await this.getUnverifiedOrders()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        throw error
      }
    },
    async addTransactionID(orderCode: string, transactionID: string) {
      try {
        await agent.VivaWallet.addTransactionID(orderCode, transactionID)
        await this.getUnverifiedOrders()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        throw error
      }
    },
    async resendOdooWebhook(orderID: number) {
      try {
        await agent.VivaWallet.resendWebhook(orderID)
        await this.getUnverifiedOrders()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        throw error
      }
    }
  }
})
