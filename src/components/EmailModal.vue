<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { usePaymentStore } from '@/stores/payment'
import { suggestEmailCorrection } from '@/utils/emailTypo'

const settStore = useSettingsStore()
const paymentStore = usePaymentStore()

const props = defineProps(['licenceItem'])
const email = ref(localStorage.getItem('email') ?? '')

const validateEmail = (email: string) => {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Test the email against the regular expression
  return emailRegex.test(email)
}

const error = ref(false)
const suggestion = ref<string | null>(null)
// The address the customer confirmed as typed despite a suggested correction
const confirmedEmail = ref('')

const checkTypo = () => {
  suggestion.value =
    email.value === confirmedEmail.value ? null : suggestEmailCorrection(email.value)
}

const validate = () => {
  error.value = false

  if (!validateEmail(email.value)) {
    error.value = true
    return
  }

  checkTypo()
  if (suggestion.value) return

  paymentStore.setEmail(email.value)
}

const acceptSuggestion = () => {
  if (!suggestion.value) return
  email.value = suggestion.value
  suggestion.value = null
  validate()
}

const keepEmail = () => {
  confirmedEmail.value = email.value
  suggestion.value = null
  validate()
}
</script>

<template>
  <!-- Inline email form rendered as a full page section (not a card/modal) -->
  <div class="email-page w-full">
    <div class="email-page-inner w-full max-w-5xl mx-auto">
      <div class="email-page-content p-6 md:p-8">
        <div class="max-w-3xl mx-auto">
          <svg
            class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              :stroke="settStore.settings.Color"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <h2 class="mb-4 text-2xl font-semibold text-center">
            {{ `${$t('Your item')} ${props.licenceItem.Name} ${$t('needs an email address.')}` }}
          </h2>

          <form novalidate @submit.prevent="validate">
            <div class="text-left mb-4 max-w-xl mx-auto">
              <label
                for="email"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Email</label
              >
              <div v-if="error">
                <span class="text-red-500 text-xs italic">{{
                  $t('Please enter a valid email address.')
                }}</span>
              </div>
              <input
                id="email"
                v-model.trim="email"
                name="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                autocapitalize="off"
                spellcheck="false"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Augustus@example.com"
                required
                @blur="checkTypo"
              />

              <div v-if="suggestion" class="suggestion mt-3 p-4 rounded-md border" role="alert">
                <p class="mb-3">
                  {{ $t('Did you mean') }} <strong>{{ suggestion }}</strong
                  >?
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="customcolor rounded-full px-4 py-2 text-white font-semibold"
                    @click="acceptSuggestion"
                  >
                    {{ $t('Yes, correct it') }}
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-4 py-2 border border-gray-400 font-semibold break-all"
                    @click="keepEmail"
                  >
                    {{ `${$t('No, keep')} ${email}` }}
                  </button>
                </div>
              </div>
            </div>

            <div class="flex gap-4 justify-center mt-6">
              <button
                type="submit"
                class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
              >
                {{ $t('Save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
}

.suggestion {
  background-color: var(--color-accent-tint);
  border-color: var(--color-accent);
  color: var(--color-text);
}

/* Make the email form appear like a normal page card below the page header */
.email-page {
  width: 100%;
  padding: 2rem 1rem; /* page-like spacing so it sits below the header */
}

.email-page-inner {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.email-page-content {
  background: transparent; /* don't look like a card */
}

.email-page h2 {
  font-weight: 600;
}

.email-page .customcolor {
  color: #fff;
}
</style>
