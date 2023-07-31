<script setup lang="ts">
  import { onMounted } from 'vue';
  import { usePaymentStore } from '@/stores/PaymentStore'

  const paymentStore = usePaymentStore()

  onMounted(() => {
    //@ts-ignore
    //Will become env variable
    const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    const secret = 'sk_test_51NTszUJEpEVZWKtcNKGjwB0VnXMpO6AXsmQeYGShsJjFnxMtfTmWVyiibgskvQFVetnFv9Wy4N3sLso8fPjLWX39006RxlTTYX'
    const options = {
      mode: 'payment',
      amount: paymentStore.price + paymentStore.tip,
      currency: 'eur',
      // Fully customizable with appearance API.
    };
    const appearance = {/*...*/ }

    // Set up Stripe.js and Elements to use in checkout form
    const elements = stripe.elements(options);

    // Create and mount the Payment Element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

  })

</script> 

<template>
  <main className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="row-span-2 grid grid-rows-2 grid-cols-2">
      Hier werden die Produkte Abgebildet werden
    </div>
    <form id="payment-form" className="row-span-3">
      <div id="payment-element">
        <!-- Elements will create form elements here -->
      </div>
      <div className="grid grid-cols-2 grid-rows-1 items-center">
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold my-3 mr-4 py-2 px-2 rounded-full text-lg">Abbrechen</button>
        <button id="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold my-3 ml-4 py-2 px-2 rounded-full text-lg">Bestätigen</button>
      </div>
      <div id="error-message">
        <!-- Display error message to your customers here -->
      </div>
    </form>
  </main>
</template>
