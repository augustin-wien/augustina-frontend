<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Toast from '@/components/ToastMessage.vue'
import { useI18n } from 'vue-i18n'

const paymentStore = usePaymentStore()
const settStore = useSettingsStore()
const route = useRoute()
const { t } = useI18n()

onMounted(() => {
  if (!paymentStore.transactionID && route.query.orderCode) {
    paymentStore.transactionID = route.query.orderCode as string
  }
})

const retry = () => {
  paymentStore.failedCount = 0
  paymentStore.verification = null

  paymentStore.verifyPayment().then(() => {
    // verification successful, redirect to confirmation page
    if (paymentStore.verification) {
      window.location.href = '/confirmation'
    } else {
      // show toast message or indication to the user
      toast.value = {
        message: t('Trouble verifying payment, please try again.'),
        type: 'error'
      }
    }
  })
}

type ToastMessage = {
  message: string
  type: string
}
const toast = ref<ToastMessage | null>(null)

const currentTime = new Date().toLocaleString()
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full w-full grid grid-rows-5 font-semibold text-2xl">
        <Toast v-if="toast" :toast="toast" @close="toast = null" />
        <div class="text-center">
          {{ $t('failed') }}
        </div>
        <div class="row-span-2">
          <img
            alt="Error Alert"
            className="logo mx-auto my-1"
            src="@/assets/red-alert-icon.svg"
            width="180"
            height="105"
          />
        </div>
        <div class="text-center text-lg">
          {{ $t('Order Code') }}: {{ paymentStore.transactionID }}
          <div class="text-sm mt-2">
            {{ currentTime }}
          </div>
        </div>
        <div class="text-center">
          <button
            id="retry-button"
            class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
            :style="paymentStore.agbChecked ? 'background-color:' + settStore.settings.Color : ''"
            @click="retry"
          >
            {{ $t('tryagain') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>
