<script setup lang="ts">
import Toast from '@/components/ToastMessage.vue'
import { useShopStore } from '@/stores/ShopStore'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const shopStore = useShopStore()
const settStore = useSettingsStore()
const vendorStore = useVendorStore()

const checkVendor = () => {
  window.location.href = vendorStore.vendorLink
}

const settings = settStore.settings
const items = shopStore.items
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
      <div id="shop-page" className="h-full grid grid-rows-5 w-full">
        <div class="row-span-4 w-full h-full">
          <div class="shop-header">
            <div id="page-title" className="text-center font-semibold text-xl">
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
          <!-- <div class="shop-hint text-sm mb-2 mt-4 px-4">
              {{ $t('product') }}
         </div> -->
          <div class="h-5/6 pb-3">
            <Toast v-if="toast" :toast="toast" />
            <ul
              id="items-list"
              class="list-image-none overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl"
            >
              <li class="item">
                <div class="flex w-full p-1 pt-2 relative">
                  <div class="flex-none grid grid-rows-1 place-content-start mr-2 item-left">
                    <div class="pb-1">
                      <RouterLink
                        :to="{
                          name: 'Item Available',
                          query: { item: shopStore.getItembyId(settings.MainItem).ID }
                        }"
                      >
                        <div
                          class="w-[90px] h-[90%] flex-none bg-cover bg-grey-600 rounded-2xl item-img"
                          :style="
                            'background-image: url(' +
                            url +
                            shopStore.getItembyId(settings.MainItem).Image +
                            ')'
                          "
                        ></div>
                      </RouterLink>
                    </div>
                  </div>
                  <div className="place-items-center grow h-full grid grid-rows-2">
                    <div class="w-full h-full py-1 relative item-right">
                      <RouterLink
                        :to="{
                          name: 'Item Available',
                          query: { item: shopStore.getItembyId(settings.MainItem).ID }
                        }"
                      >
                        <button
                          class="bg-gray-500 absolute rounded-full text-center w-6 text-white font-bold top-0 right-0"
                        >
                          i
                        </button>
                        <div
                          class="item-name bg-black h-16 w-full rounded-full text-center text-white font-semibold text-xl flex justify-center items-center"
                          :style="{
                            'background-color':
                              shopStore.getItembyId(settings.MainItem).ItemColor ||
                              (shopStore.getItembyId(settings.MainItem).LicenseItem
                                ? '#ffee00'
                                : '#000000'),
                            color:
                              shopStore.getItembyId(settings.MainItem).ItemTextColor ||
                              (shopStore.getItembyId(settings.MainItem).LicenseItem
                                ? '#000000'
                                : '#ffffff')
                          }"
                        >
                          {{ shopStore.getItembyId(settings.MainItem).Name }}
                          {{ (shopStore.getItembyId(settings.MainItem).Price / 100).toFixed(2) }}€
                        </div>
                      </RouterLink>
                    </div>
                    <div className="flex grow h-full pb-2 w-full">
                      <button>
                        <div
                          class="button-down customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                          @click="shopStore.subtractItem(settings.MainItem)"
                        >
                          -
                        </div>
                      </button>
                      <div
                        class="border-2 border-black text-black text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1"
                      >
                        <div>
                          {{ shopStore.getAmount(settings.MainItem) }}
                        </div>
                      </div>
                      <button class="place-content-">
                        <div
                          class="button-up customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                          @click="shopStore.addItem(settings.MainItem)"
                        >
                          +
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              <li v-for="item in items" :key="item.ID" class="item">
                <div
                  v-if="item.ID != settings.MainItem"
                  class="flex w-full p-1 pt-2 relative border-t-4"
                >
                  <div
                    v-if="item.Image"
                    class="flex-none grid grid-rows-1 place-content-start mr-2 item-left"
                  >
                    <div class="pb-1">
                      <RouterLink :to="{ name: 'Item Available', query: { item: item.ID } }">
                        <div
                          class="w-[90px] h-[90%] flex-none bg-cover bg-grey-600 rounded-2xl item-img"
                          :style="'background-image: url(' + url + item.Image + ')'"
                        ></div>
                      </RouterLink>
                    </div>
                  </div>
                  <div className="place-items-center grow h-full grid grid-rows-2 item-right">
                    <div class="w-full h-full py-1 relative">
                      {{ item.ItemColor }}123

                      <RouterLink :to="{ name: 'Item Available', query: { item: item.ID } }">
                        <button
                          class="bg-gray-500 absolute rounded-full text-center w-6 text-white font-bold top-0 right-0"
                        >
                          i
                        </button>

                        <div
                          :class="{
                            'h-16': true,
                            'w-full': true,
                            'rounded-full': true,
                            'text-center': true,
                            'font-semibold': true,
                            'text-xl': true,
                            flex: true,
                            'justify-center': true,
                            'items-center': true
                          }"
                          :style="{
                            'background-color': item.ItemColor ? item.ItemColor : '#000000',
                            color: item.ItemTextColor ? item.ItemTextColor : '#ffffff'
                          }"
                        >
                          {{ item.Name }} {{ (item.Price / 100).toFixed(2) }}€
                        </div>
                      </RouterLink>
                    </div>
                    <div className="flex grow h-full pb-2 w-full">
                      <button>
                        <div
                          class="button-down customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                          @click="shopStore.subtractItem(item.ID)"
                        >
                          -
                        </div>
                      </button>
                      <div
                        class="border-2 border-black text-black text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1"
                      >
                        <div>
                          {{ shopStore.getAmount(item.ID) }}
                        </div>
                      </div>
                      <button class="place-content-">
                        <div
                          class="button-up customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                          @click="shopStore.addItem(item.ID)"
                        >
                          +
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="place-items-center row-span-1 w-full flex">
          <button
            id="next-button"
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
