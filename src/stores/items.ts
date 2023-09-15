import { defineStore } from 'pinia'
import { fetchItems, postItems, patchItem, removeItem } from '@/api/api'

//define interface to store data from backend properly
export interface Item {
  Description: 'string'
  ID: 0
  Image: 'string'
  Name: 'string'
  Price: 0
}

export const itemStore = defineStore('items', {
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
      postItems(newItem)
        .then((data) => {
          this.getItems()
        })
        .catch((error) => {
          console.log('Error creating item:', error)
        })
    },

    async updateItem(updatedItem: Item) {
      patchItem(updatedItem)
        .then((data) => {
          this.getItems()
        })
        .catch((error) => {
          console.log('Error updating item:', error)
        })
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
