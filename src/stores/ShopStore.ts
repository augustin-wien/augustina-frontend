import { defineStore } from 'pinia'
import { fetchItems } from '@/api/api'
import { type Item } from './items'

export interface Amount {
  item: number
  quantity: number
}

export const useShopStore = defineStore('shop', {
  state: () => {
    return {
      items: [] as Item[],
      // cached promise for in-flight or completed items fetch
      itemsPromise: null as Promise<Item[]> | null,
      amount: [] as Amount[],
      donationItem: 2
    }
  },
  getters: {
    donation: (state) => {
      return state.amount.find((item) => item.item == 2)?.quantity
    },
    donationInEuro: (state) => {
      const donElement = state.amount.find((item) => item.item == 2)
      if (donElement) return donElement.quantity / 100
      else return 0
    }
  },
  actions: {
    async getItems() {
      // If items already loaded, return them immediately
      if (this.items && this.items.length > 0) {
        return Promise.resolve(this.items)
      }

      // If a fetch is already in progress or completed, reuse the promise
      if (this.itemsPromise) {
        return this.itemsPromise
      }

      // Start fetch and cache the promise so subsequent callers reuse it
      this.itemsPromise = fetchItems()
        .then((data) => {
          this.items = data.data
          return this.items
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error)
          // clear the cached promise on error so callers can retry
          this.itemsPromise = null
          throw error
        })

      return this.itemsPromise
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
    },
    subtractItem(id: number) {
      const item = this.items.find((item) => item.ID == id)

      if (!item) {
        return
      }

      for (const selectedItem of this.amount) {
        if (id == selectedItem.item && selectedItem.quantity > 0) {
          selectedItem.quantity--
        }
      }
    },
    reset() {
      this.amount = []
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
      for (const entry of this.amount) {
        if (entry.quantity != 0) {
          this.amount.push(entry)
        }
      }
    },
    getPriceInEuro(id: number) {
      const item = this.items.find((item) => item.ID == id)

      if (item) {
        return item.Price / 100.0
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
        ItemColor: '',
        ItemTextColor: '',
        IsLicenseItem: false,
        Price: 0
      }
    },
    calculateSum() {
      let sum = 0

      this.amount.forEach((item) => {
        const price = this.items.find((i) => i.ID == item.item)?.Price

        if (price) {
          sum += price * item.quantity
        } else if (item.item == this.donationItem) {
          sum += item.quantity
        }
      })

      // should be in euro
      return sum / 100
    },
    setDonation(amount: number) {
      // remove old donation
      this.amount = this.amount.filter((item) => item.item != this.donationItem)
      // add new donation
      this.amount.push({ item: this.donationItem, quantity: Math.floor(amount) })
    },
    deleteZeroDonation() {
      if (this.amount.find((item) => item.item == this.donationItem)?.quantity == 0)
        this.amount = this.amount.filter((item) => item.item != this.donationItem)
    },
    incrementDonation() {
      for (const selectedItem of this.amount) {
        if (this.donationItem == selectedItem.item) {
          selectedItem.quantity += 100
        }
      }
    },
    decrementDonation() {
      const donationId = 2

      for (const selectedItem of this.amount) {
        if (donationId == selectedItem.item && selectedItem.quantity > 0) {
          selectedItem.quantity -= 100
        }
      }
    }
  }
})
