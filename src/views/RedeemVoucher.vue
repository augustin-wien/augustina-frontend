<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { checkVoucher, redeemVoucher } from '@/api/api'
import type { VoucherCheck, VoucherRedemption } from '@/api/api'
import { useSettingsStore } from '@/stores/settings'
import { suggestEmailCorrection } from '@/utils/emailTypo'
import { apiErrorMessage } from '@/utils/apiError'
import { isAxiosError } from 'axios'

const route = useRoute()
const { t } = useI18n()
const settStore = useSettingsStore()

const code = ref('')
const voucher = ref<VoucherCheck | null>(null)
const redemption = ref<VoucherRedemption | null>(null)
const email = ref('')
const firstName = ref('')
const lastName = ref('')
const loading = ref(false)
const error = ref('')
const emailSuggestion = ref<string | null>(null)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const durationText = (months: number) => {
  if (months % 12 === 0) return t('voucherDurationYears', { count: months / 12 }, months / 12)
  return t('voucherDurationMonths', { count: months }, months)
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const errorMessage = (err: unknown) => {
  const status = isAxiosError(err) ? err.response?.status : undefined
  if (status === 404) return t('voucherNotFound')

  if (status === 409) {
    return apiErrorMessage(err).includes('disabled')
      ? t('voucherDisabled')
      : t('voucherAlreadyRedeemed')
  }

  if (status === 429) return t('voucherTooManyAttempts')
  return t('voucherRedeemFailed')
}

const check = async () => {
  error.value = ''
  voucher.value = null
  if (!code.value.trim()) return
  loading.value = true

  try {
    const res = await checkVoucher(code.value)

    if (res.data.Status === 'redeemed') {
      error.value = t('voucherAlreadyRedeemed')
    } else if (res.data.Status === 'disabled') {
      error.value = t('voucherDisabled')
    } else {
      voucher.value = res.data
      code.value = res.data.Code
    }
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

const redeem = async () => {
  error.value = ''

  if (!voucher.value || !emailValid.value) {
    error.value = t('Please enter a valid email address.')
    return
  }

  loading.value = true

  try {
    const res = await redeemVoucher({
      Code: voucher.value.Code,
      Email: email.value.trim(),
      FirstName: firstName.value.trim(),
      LastName: lastName.value.trim()
    })

    redemption.value = res.data
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

const checkEmailTypo = () => {
  emailSuggestion.value = suggestEmailCorrection(email.value)
}

const acceptSuggestion = () => {
  if (emailSuggestion.value) email.value = emailSuggestion.value
  emailSuggestion.value = null
}

const readUrl = computed(
  () => settStore.settings.DigitalItemsUrl || settStore.settings.OnlinePaperUrl || ''
)

onMounted(() => {
  const fromUrl = route.query.code

  if (typeof fromUrl === 'string' && fromUrl) {
    code.value = fromUrl
    check()
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div id="redeem-voucher-page" class="redeem w-full max-w-xl mx-auto px-4 pb-8">
        <h1 class="text-3xl font-bold text-center mb-6">{{ $t('voucherRedeemTitle') }}</h1>

        <div v-if="redemption" id="redeem-success" class="text-center">
          <p class="text-xl font-semibold mb-3">{{ $t('voucherRedeemedTitle') }}</p>
          <p class="mb-2">
            {{
              $t('voucherRedeemedPeriod', {
                item: redemption.ItemName,
                from: formatDate(redemption.FromDate),
                to: formatDate(redemption.ToDate)
              })
            }}
          </p>
          <p class="mb-6">{{ $t('voucherRedeemedMail', { email: redemption.Email }) }}</p>
          <a v-if="readUrl" :href="readUrl" target="_blank" rel="noopener noreferrer">
            <button
              type="button"
              class="rounded-full text-center p-5 customfont text-xl font-semibold w-full"
              :style="'background-color:' + settStore.settings.Color"
            >
              {{ $t('voucherStartReading') }}
            </button>
          </a>
        </div>

        <template v-else>
          <form v-if="!voucher" novalidate @submit.prevent="check">
            <p class="mb-4 text-center">{{ $t('voucherRedeemIntro') }}</p>
            <label for="voucher-code" class="block mb-2 text-sm font-medium">
              {{ $t('voucherCode') }}
            </label>
            <input
              id="voucher-code"
              v-model.trim="code"
              type="text"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="XXXX-XXXX-XXXX"
              class="redeem-input code-input"
              required
            />
            <button
              type="submit"
              class="rounded-full text-center p-4 customfont text-xl font-semibold w-full mt-4"
              :style="'background-color:' + settStore.settings.Color"
              :disabled="loading || !code"
            >
              {{ loading ? $t('loading') : $t('voucherCheck') }}
            </button>
          </form>

          <form v-else novalidate @submit.prevent="redeem">
            <div id="voucher-details" class="voucher-card rounded-2xl p-5 mb-6 text-center">
              <p class="text-sm">{{ $t('voucherFor') }}</p>
              <p v-if="voucher.RecipientName" class="text-2xl font-bold">
                {{ voucher.RecipientName }}
              </p>
              <p class="text-lg font-semibold mt-2">
                {{ voucher.ItemName }} · {{ durationText(voucher.DurationMonths) }}
              </p>
              <p v-if="voucher.Message" class="italic mt-3 whitespace-pre-line">
                {{ voucher.Message }}
              </p>
              <p class="font-mono mt-3 text-sm">{{ voucher.Code }}</p>
            </div>

            <p class="mb-4 text-sm">{{ $t('voucherEmailHint') }}</p>
            <label for="redeem-email" class="block mb-2 text-sm font-medium">Email</label>
            <input
              id="redeem-email"
              v-model.trim="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              autocapitalize="off"
              spellcheck="false"
              class="redeem-input"
              placeholder="Augustus@example.com"
              required
              @blur="checkEmailTypo"
            />
            <p v-if="emailSuggestion" class="text-sm mt-2" role="alert">
              {{ $t('Did you mean') }}
              <button type="button" class="underline font-semibold" @click="acceptSuggestion">
                {{ emailSuggestion }}</button>?
            </p>
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label for="redeem-firstname" class="block mb-2 text-sm font-medium">
                  {{ $t('firstName') }}
                </label>
                <input
                  id="redeem-firstname"
                  v-model="firstName"
                  type="text"
                  autocomplete="given-name"
                  maxlength="100"
                  class="redeem-input"
                  :placeholder="$t('optional')"
                />
              </div>
              <div>
                <label for="redeem-lastname" class="block mb-2 text-sm font-medium">
                  {{ $t('lastName') }}
                </label>
                <input
                  id="redeem-lastname"
                  v-model="lastName"
                  type="text"
                  autocomplete="family-name"
                  maxlength="100"
                  class="redeem-input"
                  :placeholder="$t('optional')"
                />
              </div>
            </div>
            <button
              type="submit"
              class="rounded-full text-center p-4 customfont text-xl font-semibold w-full mt-6"
              :style="'background-color:' + settStore.settings.Color"
              :disabled="loading || !emailValid"
            >
              {{ loading ? $t('loading') : $t('voucherRedeem') }}
            </button>
            <button
              type="button"
              class="text-sm underline w-full mt-3"
              @click="((voucher = null), (error = ''))"
            >
              {{ $t('voucherOtherCode') }}
            </button>
          </form>

          <p v-if="error" id="redeem-error" class="text-red-600 text-center mt-4" role="alert">
            {{ error }}
          </p>
        </template>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customfont {
  color: v-bind(settStore.settings.FontColor);
}

.redeem-input {
  display: block;
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #f9fafb;
  color: #111827;
}

.code-input {
  font-family: ui-monospace, monospace;
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}

.voucher-card {
  border: 2px dashed v-bind(settStore.settings.Color);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .redeem-input {
    background: #374151;
    border-color: #4b5563;
    color: #fff;
  }
}
</style>
