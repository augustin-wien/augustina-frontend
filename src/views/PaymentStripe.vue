<template>
  <div>
    <ul role="list" class="my-7 mx-3 space-y-2">
      <li class="flex space-x-3">
        <svg 
          class="w-8 h-8 text-gray-600" 
          viewBox="0 0 24 24">
          <path 
            fill="currentColor" 
            d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" />
        </svg>
        <span 
          class="text-2xl font-normal leading-tight text-gray-500"
          >Total: €</span
        >
      </li>
      <li class="flex space-x-3">
        <svg 
          class="w-8 h-8 text-gray-600" viewBox="0 0 24 24">
          <path 
            fill="currentColor" 
            d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" />
        </svg>
        <span class="text-2xl font-normal leading-tight text-gray-500"
          >Produkt: <b>Zeitung</b></span
        >
      </li>
    </ul>
    <div class="mt-5">
      <!-- stripe -->
      <StripeElementCard></StripeElementCard>

      <!-- We'll put the error messages in this element -->
      <div
        id="card-errors"
        role="alert"
        class="mx-3 text-error-message text-lg font-semibold"
      ></div>
      <div class="justify-center mx-3">
        <button
          class="w-full h-8 mb-3 text-white shadow-md 
          bg-indigo-500 border mt-5 rounded-md hover:bg-indigo-400 pb-1"
        >
          Pay with Stripe
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    import { loadStripe } from '@stripe/stripe-js';
    import { useStripeStore } from '@/stores/stripe'

    const stripeStore = useStripeStore()
    const style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
    }

    const stripe = null
    loadStripe('tc2yNFPJ9DYSmhNnf04vCUmbM3f MS94WK2w1YuhiTcxMIti8p3etufbrsr1oJpG2OUaLUmNUTU00cxAmOXLZ').then((val:any) =>
      stripeStore.stripe = val
    )
    const settStore = settingsStore()
    onMounted(() => {settStore.fetchSettings()})
</script>