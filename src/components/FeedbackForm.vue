<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { sendFeedback } from '@/api/api'
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import { getLastRequestId } from '@/utils/requestId'

const MAX_LENGTH = 2000

const props = defineProps<{
  transactionId?: string
  vendorId?: string
}>()

const route = useRoute()
const { t } = useI18n()
const settingsStore = useSettingsStore()
const paymentStore = usePaymentStore()
const vendorStore = useVendorStore()

const open = ref(false)
const message = ref('')
const sending = ref(false)
const sent = ref(false)
const failed = ref(false)

const visible = computed(() => settingsStore.settings.FeedbackEnabled === true)

// After a VivaWallet checkout the payment store holds the raw "t=...&s=..." query: t is the
// transaction id, s the order code
const transactionId = computed(() => {
  const raw = props.transactionId || paymentStore.transactionID || ''
  const params = new URLSearchParams(raw)

  return params.get('t') || params.get('s') || raw
})

const vendorId = computed(() => props.vendorId || vendorStore.vendorid || '')

const requestId = ref('')

const attachedInfo = computed(() =>
  [
    [t('feedbackVendorId'), vendorId.value],
    [t('feedbackTransactionId'), transactionId.value],
    [t('feedbackRequestId'), requestId.value]
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join(', ')
)

const toggle = () => {
  open.value = !open.value
  requestId.value = getLastRequestId()
}

const submit = async () => {
  if (!message.value.trim() || sending.value) return

  sending.value = true
  failed.value = false

  try {
    await sendFeedback({
      Message: message.value.trim(),
      TransactionID: transactionId.value,
      RequestID: requestId.value,
      VendorID: vendorId.value,
      Page: route.path
    })

    sent.value = true
    open.value = false
    message.value = ''
  } catch {
    failed.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="visible" class="feedback-form w-full text-center text-sm font-normal">
    <p v-if="sent" class="feedback-thanks">{{ $t('feedbackThanks') }}</p>
    <template v-else>
      <button v-if="!open" type="button" class="feedback-open underline" @click="toggle">
        {{ $t('feedbackGive') }}
      </button>
      <form v-else class="flex flex-col gap-2 text-left" @submit.prevent="submit">
        <label for="feedback-message" class="font-semibold">{{ $t('feedbackQuestion') }}</label>
        <textarea
          id="feedback-message"
          v-model="message"
          :maxlength="MAX_LENGTH"
          rows="4"
          class="w-full rounded-xl border-2 border-gray-200 p-2"
        ></textarea>
        <p class="text-xs text-gray-500">
          {{ $t('feedbackAttached') }}
          {{ attachedInfo || $t('feedbackPageOnly') }}
        </p>
        <p v-if="failed" class="feedback-error text-red-700">{{ $t('feedbackFailed') }}</p>
        <div class="flex items-center justify-end gap-3">
          <button type="button" class="underline" @click="toggle">{{ $t('cancel') }}</button>
          <button
            type="submit"
            class="feedback-submit rounded-full px-4 py-2 font-semibold"
            :disabled="sending || !message.trim()"
            :style="
              'background-color:' +
              settingsStore.settings.Color +
              '; color: ' +
              settingsStore.settings.FontColor
            "
          >
            {{ $t('feedbackSend') }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
