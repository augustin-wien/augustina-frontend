<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useVendorStore } from '@/stores/vendor'
import { useShopStore } from '@/stores/ShopStore'

const router = useRouter()
const shopStore = useShopStore()
const vendorStore = useVendorStore()
const settStore = useSettingsStore()
const fetch = settStore.getSettingsFromApi
const price = computed(() => settStore.settings.MainItemPrice / 100)

onMounted(() => {
  fetch().then(() => {
    shopStore.reset()

    shopStore
      .getItems()
      .then(() => {
        usePaymentStore().setPrice(settStore.settings.MainItemPrice)
        usePaymentStore().setPricePerPaper(settStore.settings.MainItemPrice)

        if (shopStore.items.length == 0) {
          router.push({ name: 'Error' })
        } else if (shopStore.amount.length == 0) {
          shopStore.addItem(settStore.settings.MainItem)
        }
      })
      .catch(() => {
        router.push({ name: 'Error' })
        // eslint-disable-next-line no-console
        console.log('error')
      })
  })
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template v-if="settStore.settings.MainItemPrice" #main>
      <div className="grid grid-rows-5 h-full place-items-center w-full">
        <div class="row-span-2 grid grid-rows-3 h-full w-full">
          <div className="text-center font-semibold text-2xl pt-5">
            {{ $t('buyItem') }}
          </div>
          <div class="flex place-content-center">
            <div class="text-center min-w-fit h-4/5 text-4xl rounded-full text-black font-bold">
              {{ vendorStore.vendorName }}
            </div>
          </div>
          <div class="place-items-start w-full flex">
            
            <div
              class="text-xl grow h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full"
            >
              1x {{ shopStore.getName(settStore.settings.MainItem) }}
            </div>
          </div>
        </div>
        <div className="w-full">
          <p className="text-center text-8xl font-semibold">{{ price }}€</p>
        </div>
        <RouterLink :to="{ name: 'Shop'}" class="w-full text-3xl font-semibold place-se">
          <button className="w-full customcolor p-5 rounded-full text-3xl">
          {{ $t("shop") }}
        </button>
        </RouterLink>
     
        <div className="place-items-center w-full flex">
          <RouterLink class="text-center h-[76px] grow" :to="{ name: 'Tippingpage' }">
            <button
              class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold"
            >
              {{ $t('next') }}
            </button>
          </RouterLink>
        </div>
      </div>
      <div class="absolute"></div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
  fill: v-bind(settStore.settings.FontColor);
}
</style>
