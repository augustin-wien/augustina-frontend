<script setup lang="ts">
import WaitingAnimation from '@/components/WaitingAnimation.vue'
import { useShopStore } from '@/stores/ShopStore'
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import { onMounted, ref } from 'vue'

const shopStore = useShopStore()
const paymentStore = usePaymentStore()
const settings = useSettingsStore()
const vendorStore = useVendorStore()
const items = shopStore.amount

const errorMessage = ref('')
const errorMessageDetail = ref('')
const errorTimestamp = ref(new Date().toISOString())
const donation = shopStore.donation

onMounted(() => {
  if (!(donation && donation > 0)) {
    shopStore.deleteZeroDonation()
  }

  // delete empty items
  const itemsCleaned = items.filter((item) => item.quantity > 0)

  paymentStore
    .postOrder(itemsCleaned, 1, vendorStore.vendorid, paymentStore.email)
    .catch((error) => {
      errorMessage.value = error.message
      errorMessageDetail.value = error.response.data
      // eslint-disable-next-line no-console
      console.log(error)
    })
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main className="h-full grid grid-rows-6 place-items-center">
        <WaitingAnimation v-if="errorMessage === ''" />
        <div v-else>
          <div class="text-center font-semibold text-3xl pb-4 text-rose-700 pt-10">
            {{ $t('error') }}
          </div>
          <div class="text-center font-semibold text-3xl pb-4">
            {{ errorMessage }}
          </div>
          <div class="text-center text-small pb-4">
            {{ errorMessageDetail }}
          </div>
          <div class="text-center">{{ errorTimestamp }}</div>
        </div>
      </main>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settings.settings.Color);
}
</style>
