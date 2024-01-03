import { defineStore } from 'pinia'
import { fetchItems } from '@/api/api'
import { type Item } from './items'
import { usePaymentStore } from './payment'

const paymentStore = usePaymentStore()

export interface Amount {
  item: number
  quantity: number
}

export const useShopStore = defineStore('shop', {
  state: () => {
    return {
      items: [] as Item[],
      amount: [] as Amount[],
      finalitems: [] as Amount[]
    }
  },
  actions: {
    async getItems() {
      return new Promise((resolve, reject) => {
        fetchItems()
          .then((data) => {
            this.items = data.data
            resolve(this.items)
          })
          .catch((error) => {
            console.log(error)
            reject(error)
          })
      })
    },
    addItem(id: number) {
      const item = this.items.find((item) => item.ID == id)

      if (!item) {
        return
      }

      let inList = false

      for (const selectedItem of this.amount) {
        if (id == selectedItem.item) {
          inList = true
          selectedItem.quantity++
        }
      }

      if (inList == false) {
        this.amount.push({ item: id, quantity: 1 })
      }

      paymentStore.sum += item.Price
    },
    subtractItem(id: number) {
      const item = this.items.find((item) => item.ID == id)

      if (!item) {
        return
      }

      for (const selectedItem of this.amount) {
        if (id == selectedItem.item && selectedItem.quantity > 0) {
          selectedItem.quantity--
          paymentStore.sum -= item.Price
        }
      }
    },
    reset() {
      this.amount = []
      this.finalitems = []
      paymentStore.sum = 0
      paymentStore.tip = 0
    },
    getAmount(id: number) {
      const item = this.amount.find((item) => item.item == id)

      if (item) {
        return item.quantity
      }

      return 0
    },
    getName(id: number) {
      for (const item of this.items) {
        if (id == item.ID) {
          return item.Name
        }
      }

      return 'Spende'
    },
    removeEmty() {
      this.finalitems = []

      for (const entry of this.amount) {
        if (entry.quantity != 0) {
          this.finalitems.push(entry)
        }
      }
    },
    getPriceInEuro(id: number) {
      const item = this.items.find((item) => item.ID == id)

      if (item) {
        return item.Price / 100
      }

      return 0
    },
    getItembyId(id: number) {
      for (const entry of this.items) {
        if (entry.ID == id) {
          return entry
        }
      }

      return {
        Description: '',
        ID: 0,
        Image: '',
        Name: '',
        Price: 0
      }
    },
    calculateSum() {
      let sum = 0

      this.amount.forEach((item) => {
        const price = this.items.find((i) => i.ID == item.item)?.Price

        if (price) {
          sum += price * item.quantity
        }
      })

      return sum
    }
    }
  }
)
