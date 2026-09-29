import { defineStore } from 'pinia'
import {
  fetchItemsBackoffice,
  fetchArchivedItems,
  fetchItems,
  postItems,
  patchItem,
  removeItem,
  restoreItem
} from '@/api/api'

//define interface to store data from backend properly
export const ITEM_TYPES = [
  'normal_item',
  'issue',
  'online_issue',
  'abonement',
  'donation',
  'transaction_costs',
  'license_item'
] as const

export type ItemType = (typeof ITEM_TYPES)[number]

export interface Item {
  Description: 'string'
  ID: number
  Image: 'string' | null | undefined
  Name: 'string'
  Price: number
  Disabled: boolean
  Archived?: boolean
  IsLicenseItem: boolean
  LicenseItem: number | null
  LicenseGroup: string | null
  IsPDFItem: boolean
  PDF: string | null
  ItemColor: string | null
  ItemOrder: number
  ItemTextColor: string | null
  Type: ItemType | string
  LicenseCost?: number
}

export const useItemsStore = defineStore('items', {
  state: () => {
    return {
      items: [] as Item[],
      itemsBackoffice: [] as Item[],
      // Includes archived (deleted) items. Use this wherever historic payments
      // are shown or exported, since they may reference deleted items.
      itemsWithArchived: [] as Item[],
      archivedItems: [] as Item[]
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
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },
    async getItemsBackoffice() {
      try {
        const data = await fetchItemsBackoffice()
        this.itemsBackoffice = data.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },

    async getItemsWithArchived() {
      try {
        const data = await fetchItemsBackoffice(true)
        this.itemsWithArchived = data.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },
    async getArchivedItems() {
      try {
        const data = await fetchArchivedItems()
        this.archivedItems = data.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },
    async restoreItem(itemId: number) {
      await restoreItem(itemId)
      await Promise.all([this.getArchivedItems(), this.getItemsBackoffice()])
    },

    async createItem(newItem: Item) {
      return postItems(newItem)
    },

    async updateItem(updatedItem: Item) {
      return patchItem(updatedItem)
    },
    async deleteItem(itemId: number) {
      await removeItem(itemId)
      this.getItems()
    }
  }
})
