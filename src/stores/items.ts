import { defineStore } from 'pinia'
import { fetchItems, postItems, patchItem, removeItem } from '@/api/api'

//define interface to store data from backend properly
export interface Item {
  Description: 'string'
  Id: 0
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
        console.log(this.items)
        console.log('Items fetched from database')
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },

    async createItem(newItem: Item) {
      console.log(JSON.stringify(newItem))

      postItems(newItem)
        .then((data) => {
          console.log('Item created:', data.data)
          this.getItems()
          console.log(data)
        })
        .catch((error) => {
          console.log('Error creating item:', error)
        })
    },

    async updateItem(updatedItem: Item) {
      console.log(JSON.stringify(updatedItem))
      patchItem(updatedItem)
        .then((data) => {
          console.log('Item updated:', data.data)
          this.getItems()
        })
        .catch((error) => {
          console.log('Error updating item:', error)
        })
    },
    async deleteItem(itemId: number) {
      removeItem(itemId)
        .then(() => {
          console.log('Item deleted:', itemId)
          this.getItems()
        })
        .catch((error) => {
          console.log('Error deleting item:', error)
        })
    }
  }
})
