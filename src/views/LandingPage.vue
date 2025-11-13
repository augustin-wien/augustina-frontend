<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useVendorStore } from '@/stores/vendor'
import { useShopStore } from '@/stores/ShopStore'
import IconCross from '@/components/icons/IconCross.vue'
import IconAvatar from '@/components/icons/IconAvatar.vue'

const router = useRouter()
const route = useRoute()
const shopStore = useShopStore()
const vendorStore = useVendorStore()
const settStore = useSettingsStore()
const price = computed(() => (settStore.settings.MainItemPrice / 100).toFixed(2))

const checkVendor = () => {
  window.location.href = vendorStore.vendorLink
}

onMounted(() => {
  settStore.getSettingsFromApi().then(() => {
    // ensure we have a vendor id (in case of direct reload); prefer store value but fall back to route param
    if (!vendorStore.vendorid && route.params && route.params.vendorid) {
      // route.params.vendorid may be string or array; normalize to string
      const vid = Array.isArray(route.params.vendorid)
        ? route.params.vendorid[0]
        : route.params.vendorid

      if (vid) vendorStore.vendorid = String(vid)
    }

    shopStore.reset()

    shopStore
      .getItems()
      .then(() => {
        usePaymentStore().setPrice(settStore.settings.MainItemPrice)
        usePaymentStore().setPricePerPaper(settStore.settings.MainItemPrice)

        if (settStore.settings.ShopLanding) {
          router.push('/v/' + vendorStore.vendorid + '/shop')
        }

        if (shopStore.items.length == 0) {
          router.push({ name: 'Error' })
        } else if (shopStore.amount.length == 0 && !settStore.settings.ShopLanding) {
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
    <template
      v-if="
        settStore.settings.MainItemPrice &&
        settStore.settings.ShopLanding != undefined &&
        !settStore.settings.ShopLanding
      "
      #main
    >
      <div id="landing-page" className="grid grid-rows-5 h-full place-items-center w-full">
        <div class="row-span-4 grid grid-rows-5 h-full w-full">
          <div id="title" className="text-center font-semibold text-2xl pt-5">
            {{ $t('buyItem') }}
          </div>
          <div class="flex relative items-center justify-center">
            <div id="vendor-name" class="customfont text-center text-black font-bold">
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

          <RouterLink
            id="landing-page-shop"
            :to="{ name: 'Shop' }"
            class="grid grid-rows-2 h-[13vh] w-full customcolor roundedcorner items-center place-items-center"
          >
            <div
              class="w-full h-full text-2xl text-center font-semibold text-white bg-black rounded-full place-self-center flex items-center justify-center"
            >
              <p id="main-item-name" class="text-center">
                1x {{ shopStore.getName(settStore.settings.MainItem) }}
              </p>
            </div>
            <div
              id="more-items-btn"
              className="text-center w-full rounded-full text-2xl font-semibold relative flex justify-center"
            >
              <div>{{ $t('shop') }}</div>
              <IconCross class="absolute customfill rotate-45 right-0 place-self-center mr-2" />
            </div>
          </RouterLink>
          <div className="w-full row-span-2 flex items-center justify-center">
            <p id="price" className="text-center text-8xl font-semibold">{{ price }}€</p>
          </div>
        </div>

        <div className="place-items-center w-full flex">
          <RouterLink class="text-center h-[76px] grow" :to="{ name: 'Tippingpage' }">
            <button
              id="next-btn"
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
  font-size: max(
    calc(3rem - (v-bind(vendorStore.vendorName.length) * 0.1rem)),
    calc(2rem - (v-bind(vendorStore.vendorName.length) * 0.025rem)),
    0.7rem
  );
  line-height: max(
    calc(3rem - (v-bind(vendorStore.vendorName.length) * 0.09rem)),
    calc(2rem - (v-bind(vendorStore.vendorName.length) * 0.025rem)),
    0.7rem
  );
}

.avataricon {
  width: min(13vw, 60px);
  height: min(13vw, 60px);
  cursor: pointer;
}
</style>
