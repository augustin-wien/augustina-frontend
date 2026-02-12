import { defineStore } from 'pinia'
import { fetchUnverifiedOrders } from '@/api/api'
import agent from '@/api/agent'

export const useOrdersStore = defineStore('orders', {
  state: () => {
    return {
      unverifiedOrders: [] as any[]
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
    }
  }
})
