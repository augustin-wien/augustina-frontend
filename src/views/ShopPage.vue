<script setup lang="ts">
import Toast from '@/components/ToastMessage.vue'
import CampaignPopup from '@/components/CampaignPopup.vue'
import { useShopStore } from '@/stores/ShopStore'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { itemTypeClass } from '@/utils/itemTypeClass'

const shopStore = useShopStore()
const settStore = useSettingsStore()
const vendorStore = useVendorStore()

const checkVendor = () => {
  window.location.href = vendorStore.vendorLink
}

const settings = computed(() => settStore.settings)
const items = computed(() => shopStore.items)
const router = useRouter()

const url = import.meta.env.VITE_API_URL
type ToastMessage = {
  message: string
  type: string
}
const toast = ref<ToastMessage | null>(null)

onMounted(() => {
  shopStore.getItems()
})

const listItems = computed(() => {
  const main = items.value.find((item) => item.ID == settings.value.MainItem)
  const others = items.value.filter((item) => item.ID != settings.value.MainItem)
  return main ? [main, ...others] : others
})

const checkIfItemSelected = () => {
  if (shopStore.amount.length > 0) {
    let sum = 0

    for (let i = 0; i < shopStore.amount.length; i++) {
      sum += shopStore.amount[i]?.quantity || 0
    }

    if (sum > 0) router.push({ name: 'Tippingpage' })
    else {
      toast.value = {
        message: 'Bitte wähle ein Produkt aus',
        type: 'error'
      }
    }
  } else {
    toast.value = {
      message: 'Bitte wähle ein Produkt aus',
      type: 'error'
    }
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div id="shop-page" class="h-full grid grid-rows-5 w-full">
        <div class="row-span-4 w-full h-full">
          <div class="shop-header">
            <div id="page-title" class="text-center font-semibold text-xl">
              {{ $t('buyItem') }}
            </div>
            <div class="flex relative items-center justify-center">
              <div
                id="vendor-name"
                class="customfont text-center text-black font-bold text-3xl mb-4"
              >
                {{ vendorStore.vendorName }}
              </div>
              <div
                v-if="vendorStore.vendorLink != '' && vendorStore.vendorLink != null"
                class="customcolor rounded-full avataricon ml-2 justify-self-center"
                @click="checkVendor"
              >
                <IconAvatar class="customfill vendor-icon" />
              </div>
            </div>
          </div>
          <div class="h-5/6 pb-3">
            <Toast v-if="toast" :toast="toast" @close="toast = null" />
            <ul
              id="items-list"
              class="list-image-none overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl"
              :aria-label="$t('product')"
            >
              <template v-for="item in listItems" :key="item.ID">
                <li class="item" :class="itemTypeClass(item.Type)">
                  <div
                    class="flex w-full p-1 pt-2 relative"
                    :class="{ 'border-t-4': item.ID != settings.MainItem }"
                  >
                    <div
                      v-if="item.Image || item.ID == settings.MainItem"
                      class="flex-none grid grid-rows-1 place-content-start mr-2 item-left"
                    >
                      <div class="pb-1">
                        <RouterLink
                          :to="{ name: 'Item Available', query: { item: item.ID } }"
                          tabindex="-1"
                          aria-hidden="true"
                        >
                          <div
                            class="w-[90px] h-[90%] flex-none bg-cover bg-grey-600 rounded-2xl item-img"
                            :style="'background-image: url(' + url + item.Image + ')'"
                          ></div>
                        </RouterLink>
                      </div>
                    </div>
                    <div
                      class="place-items-center grow h-full grid grid-rows-2"
                      :class="{ 'item-right': item.ID != settings.MainItem }"
                    >
                      <div
                        class="w-full h-full py-1 relative"
                        :class="{ 'item-right': item.ID == settings.MainItem }"
                      >
                        <RouterLink
                          :to="{ name: 'Item Available', query: { item: item.ID } }"
                          :aria-label="$t('shopItemDetails', { name: item.Name })"
                        >
                          <button
                            type="button"
                            tabindex="-1"
                            aria-hidden="true"
                            class="bg-gray-500 absolute rounded-full text-center w-6 text-white font-bold top-0 right-0"
                          >
                            i
                          </button>
                          <div
                            class="h-16 w-full rounded-full text-center font-semibold text-xl flex justify-center items-center"
                            :class="{ 'item-name bg-black': item.ID == settings.MainItem }"
                            :style="{
                              'background-color': item.ItemColor ? item.ItemColor : '#000000',
                              color: item.ItemTextColor ? item.ItemTextColor : '#ffffff'
                            }"
                          >
                            {{ item.Name }} {{ (item.Price / 100).toFixed(2) }}€
                          </div>
                        </RouterLink>
                      </div>
                      <div class="flex grow h-full pb-2 w-full">
                        <button
                          type="button"
                          :aria-label="$t('shopDecreaseQuantity', { name: item.Name })"
                          @click="shopStore.subtractItem(item.ID)"
                        >
                          <div
                            class="button-down customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                            aria-hidden="true"
                          >
                            -
                          </div>
                        </button>
                        <div
                          class="item-quantity border-2 border-black text-black text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1"
                          role="status"
                          :aria-label="$t('shopQuantity', { name: item.Name })"
                        >
                          <div>
                            {{ shopStore.getAmount(item.ID) }}
                          </div>
                        </div>
                        <button
                          type="button"
                          :aria-label="$t('shopIncreaseQuantity', { name: item.Name })"
                          @click="shopStore.addItem(item.ID)"
                        >
                          <div
                            class="button-up customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                            aria-hidden="true"
                          >
                            +
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </div>
        <CampaignPopup />
        <div class="place-items-center row-span-1 w-full flex">
          <button
            id="next-button"
            type="button"
            class="text-center h-[76px] grow customcolor rounded-full p-5 text-white text-3xl w-full font-semibold"
            @click="checkIfItemSelected"
          >
            {{ $t('next') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}

.bg-yellow {
  background-color: #ffee00;
}
</style>
