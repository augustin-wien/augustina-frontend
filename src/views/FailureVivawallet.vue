<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Toast from '@/components/ToastMessage.vue'
import FeedbackForm from '@/components/FeedbackForm.vue'
import { useI18n } from 'vue-i18n'
import { reportVivaFailure, vivaFailureReason } from '@/utils/vivaFailure'
import agent from '@/api/agent'

const paymentStore = usePaymentStore()
const settStore = useSettingsStore()
const route = useRoute()
const { t } = useI18n()

const queryValue = (key: string) => {
  const value = route.query[key]

  return typeof value === 'string' ? value : ''
}

// Viva redirects here with s (order code), eventId and eci after a declined or aborted payment
const vivaOrderCode = queryValue('s')
const eventId = queryValue('eventId') || queryValue('EventId')
const eci = queryValue('eci') || queryValue('ECI')
const declinedAtViva = vivaOrderCode !== '' || eventId !== ''
const reason = vivaFailureReason(eventId)

const orderCodeFromVerification = () => {
  const raw = paymentStore.transactionID || queryValue('orderCode')

  return new URLSearchParams(raw).get('s') || raw
}

const orderCode = declinedAtViva ? vivaOrderCode : orderCodeFromVerification()

onMounted(() => {
  if (!paymentStore.transactionID && route.query.orderCode) {
    paymentStore.transactionID = route.query.orderCode as string
  }

  if (declinedAtViva) {
    reportVivaFailure({ orderCode: vivaOrderCode, eventId, eci })
  }

  if (/^\d+$/.test(vivaOrderCode) && /^\d+$/.test(eventId)) {
    agent.VivaWallet.reportFailure(vivaOrderCode, eventId).catch(() => undefined)
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
      <div class="h-full w-full grid grid-rows-5 font-semibold text-2xl">
        <Toast v-if="toast" :toast="toast" @close="toast = null" />
        <div class="text-center">
          {{ $t('failed') }}
        </div>
        <div class="row-span-2">
          <img
            alt="Error Alert"
            class="logo mx-auto my-1"
            src="@/assets/red-alert-icon.svg"
            width="180"
            height="105"
          />
        </div>
        <div class="text-center text-lg">
          <p v-if="declinedAtViva" id="failure-reason" class="mb-3 font-normal">
            {{ $t(`paymentFailure_${reason}`) }}
          </p>
          <template v-if="orderCode">{{ $t('Order Code') }}: {{ orderCode }}</template>
          <div class="text-sm mt-2">
            {{ currentTime }}
            <template v-if="eventId"> · {{ $t('paymentFailure_code') }} {{ eventId }}</template>
          </div>
        </div>
        <div class="text-center">
          <button
            v-if="!declinedAtViva"
            id="retry-button"
            class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
            :style="
              paymentStore.agbChecked || settStore.settings.AGBRequired === false
                ? 'background-color:' + settStore.settings.Color
                : ''
            "
            @click="retry"
          >
            {{ $t('tryagain') }}
          </button>
          <FeedbackForm class="mt-4" />
        </div>
      </div>
    </template>
  </component>
</template>
