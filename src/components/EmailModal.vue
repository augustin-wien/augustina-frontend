<script setup lang="ts">
import { ref } from 'vue'
import { settingsStore } from '@/stores/settings'
import { usePaymentStore } from '@/stores/payment'

const settStore = settingsStore()
const paymentStore = usePaymentStore()

const props = defineProps(['licenceItem'])
const email = ref('')
const validateEmail = (email: string) => {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Test the email against the regular expression
  return emailRegex.test(email)
}
const error = ref(false)
const validate = () => {
  error.value = false
  if (validateEmail(email.value)) {
    paymentStore.setEmail(email.value)
  } else {
    error.value = true
  }
}
</script>

<template>
  <!-- Main modal -->
  <div
    id="popup-modal"
    tabindex="-1"
    class="overflow-y-auto overflow-x-hidden m-auto bg-gray-700 bg-opacity-80 fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 flex h-full"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="p-4 md:p-5 text-center">
          <svg
            class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <h3 class="mb-5 text-lg font-normal">
            {{
              `${$t('Your item')} ${props.licenceItem.Name} ${$t(
                'needs an email address.'
              )}`
            }}
          </h3>
          <div class="text-left mb-4">
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
              type="text"
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Augustus@example.com"
              v-model="email"
              required
            />
          </div>
          <RouterLink class="h-[56px] w-[56px]" :to="{ name: 'Shop' }">
            <button
              data-modal-hide="popup-modal"
              type="button"
              class="text-gray-500 rounded-full bg-white hover:bg-gray-100 mr-3 focus:ring-4 focus:outline-none focus:ring-gray-200 border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              {{ $t('Back') }}
            </button>
          </RouterLink>
          <button
            data-modal-hide="popup-modal"
            type="button"
            class="customcolor rounded-full text-white bg-black-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium text-sm inline-flex items-center px-5 py-2.5 text-center me-2"
            @click="validate"
          >
            {{ $t('Save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
}
</style>
