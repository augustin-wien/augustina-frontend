<script setup lang="ts">
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

  paymentStore.postOrder(items, 1, vendorStore.vendorid, paymentStore.email).catch((error) => {
    errorMessage.value = error.message
    errorMessageDetail.value = error.response.data
    console.log(error)
  })
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main className="h-full grid grid-rows-6 place-items-center">
        <div v-if="errorMessage === ''" class="lds-ellipsis row-span-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
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
.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: v-bind(settings.settings.Color);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}

.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}

@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(24px, 0);
  }
}

.customcolor {
  background-color: v-bind(settings.settings.Color);
}
</style>
