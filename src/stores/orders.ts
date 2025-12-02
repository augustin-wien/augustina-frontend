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
    async verifyOrder(orderCode: string) {
      try {

        await agent.VivaWallet.verifyPayment("s=" + orderCode+"&t=manual")
        await this.getUnverifiedOrders()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }
})

