import { defineStore } from 'pinia'
import { fetchItems, postItems, patchItem, removeItem } from '@/api/api'

//define interface to store data from backend properly
export interface Item {
  Description: 'string'
  ID: number
  Image: 'string'
  Name: 'string'
  Price: number
}

export const useItemsStore = defineStore('items', {
  state: () => {
    return {
      items: [] as Item[]
    }
  },

  getters: {
    getitems(state) {
      return state.items
    }
  },

  actions: {
    async getItems() {
      try {
        const data = await fetchItems()
        this.items = data.data
      } catch (error) {
        console.log(error)
      }
    },

    async createItem(newItem: Item) {
      return postItems(newItem)

    },

    async updateItem(updatedItem: Item) {
      return patchItem(updatedItem)
    },
    async deleteItem(itemId: number) {
      removeItem(itemId)
        .then(() => {
          this.getItems()
        })
        .catch((error) => {
          console.log('Error deleting item:', error)
        })
    }
  }
})
