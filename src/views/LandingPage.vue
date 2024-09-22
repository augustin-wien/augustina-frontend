<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useVendorStore } from '@/stores/vendor'
import { useShopStore } from '@/stores/ShopStore'
import IconCross from '@/components/icons/IconCross.vue'
import IconAvatar from '@/components/icons/IconAvatar.vue'

const router = useRouter()
const shopStore = useShopStore()
const vendorStore = useVendorStore()
const settStore = useSettingsStore()
const fetch = settStore.getSettingsFromApi
const price = computed(() => settStore.settings.MainItemPrice / 100)

const checkVendor = () => {
  window.location.href = vendorStore.vendorLink
}

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
      <div id="landing-page" className="grid grid-rows-5 h-full place-items-center w-full">
        <div class="row-span-4 grid grid-rows-5 h-full w-full">
          <div className="text-center font-semibold text-2xl pt-5">
            {{ $t('buyItem') }}
          </div>
          <div class="flex relative place-content-center items-center justify-center">
            <div
              v-if="vendorStore.vendorLink != '' && vendorStore.vendorLink != null"
              class="customcolor rounded-full w-[60px] h-[60px] absolute right-0  justify-self-center"
              @click="checkVendor"
            >
              <IconAvatar class="customfill" />
            </div>
            <div class="customfont w-3/5 text-center text-black font-bold">
              {{ vendorStore.vendorName }}
            </div>
          </div>

          <RouterLink
            :to="{ name: 'Shop' }"
            class="grid grid-rows-2 h-[13vh] w-full customcolor roundedcorner items-center place-items-center"
          >
            <div
              class="w-full h-full text-2xl text-center font-semibold text-white bg-black rounded-full place-self-center flex items-center justify-center"
            >
              <p class="text-center">1x {{ shopStore.getName(settStore.settings.MainItem) }}</p>
            </div>
            <div
              className="text-center w-full rounded-full text-2xl font-semibold relative flex justify-center"
            >
              <div>{{ $t('shop') }}</div>
              <IconCross class="absolute customfill rotate-45 right-0 place-self-center mr-2" />
            </div>
          </RouterLink>
          <div className="w-full row-span-2 flex items-center justify-center">
            <p className="text-center text-8xl font-semibold ">{{ price }}€</p>
          </div>
        </div>

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

.customfill {
  fill: v-bind(settStore.settings.FontColor);
}

.roundedcorner {
  border-radius: calc(13vh / 4);
}

.customfont {
  font-size: calc(3rem - (v-bind(vendorStore.vendorName.length) * 0.07rem)); 
  line-height: calc(2.5rem - (v-bind(vendorStore.vendorName.length) * 0.03rem));
}
</style>
