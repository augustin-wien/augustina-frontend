<script setup lang="ts">
import { settingsStore } from '@/stores/settingsStore';
import { onMounted } from 'vue'

const settStore = settingsStore()
onMounted(() => {
  settStore.fetchSettings()
  //@ts-ignore
  //Will become env variable
  const stripe = Stripe('pk_test_51NPjKHElvUd6Cd58X0mtD30StUI2ugja89BsBuFmmBFAX4vswuAIy0w56rgd6VQwVz2aC42AQm3SvSeSuuZFqUug00QL7BuzzK')

  const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'eur',
    // Fully customizable with appearance API.
    appearance: {/*...*/ },
  };

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
    <div className="row-span-2">
      Hier werden die Produkte Abgebildet werden
    </div>
    <form id="payment-form" className="row-span-3">
      <div id="payment-element">
        <!-- Elements will create form elements here -->
      </div>
      <div className="grid grid-cols-2 grid-rows-1 items-center">
        <button id="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold my-3 mr-4 py-2 px-2 rounded-full">Abbrechen</button>
        <button id="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold my-3 ml-4 py-2 px- rounded-full">Bestätigen</button>
      </div>
      <div id="error-message">
        <!-- Display error message to your customers here -->
      </div>
    </form>
  </main>
</template>
