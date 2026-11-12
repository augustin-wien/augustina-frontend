import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ShopPage from '@/views/ShopPage.vue'
import { useShopStore } from '@/stores/ShopStore'
import { useSettingsStore } from '@/stores/settings'
import type { Item } from '@/stores/items'

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' }
}))

const item = (ID: number, Name: string, Type: string) =>
  ({
    ID,
    Name,
    Type,
    Price: 300,
    Image: '',
    ItemColor: null,
    ItemTextColor: null
  }) as unknown as Item

const mountShop = () => {
  const shopStore = useShopStore()
  shopStore.getItems = vi.fn()

  shopStore.items = [
    item(2, 'Spende', 'donation'),
    item(1, 'Zeitung', 'issue'),
    item(5, 'Digital', 'online_issue')
  ]

  useSettingsStore().settings.MainItem = 1

  return mount(ShopPage, {
    global: {
      mocks: {
        $t: (key: string, params?: { name?: string }) =>
          params?.name ? `${key}:${params.name}` : key,
        $route: { meta: { layout: { template: '<div><slot name="main" /></div>' } } }
      },
      stubs: { CampaignPopup: true, Toast: true }
    }
  })
}

describe('ShopPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds the product type as a class to every list entry, main item first', () => {
    const entries = mountShop().findAll('#items-list li')

    expect(entries.map((li) => li.classes().find((c) => c.startsWith('item-type-')))).toEqual([
      'item-type-issue',
      'item-type-donation',
      'item-type-online_issue'
    ])
  })

  it('labels the quantity buttons with the product name and handles clicks on the button', async () => {
    const wrapper = mountShop()
    const plus = wrapper.get('button[aria-label="shopIncreaseQuantity:Digital"]')
    await plus.trigger('click')
    expect(useShopStore().getAmount(5)).toBe(1)

    await wrapper.get('button[aria-label="shopDecreaseQuantity:Digital"]').trigger('click')
    expect(useShopStore().getAmount(5)).toBe(0)
  })

  it('gives the detail link an accessible name and keeps the info button out of focus', () => {
    const wrapper = mountShop()
    expect(wrapper.find('a[aria-label="shopItemDetails:Zeitung"]').exists()).toBe(true)

    const infoButtons = wrapper.findAll('a button')
    expect(infoButtons).toHaveLength(3)

    for (const button of infoButtons) {
      expect(button.attributes('tabindex')).toBe('-1')
      expect(button.attributes('aria-hidden')).toBe('true')
    }
  })
})
