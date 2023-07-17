<script lang="ts">
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    import { useStripeStore } from '@/stores/stripe'

    /*
    const plugin = document.createElement("script");
    plugin.setAttribute(
      "src",
      "https://js.stripe.com/v3"
    );
    plugin.async = true;
    document.head.appendChild(plugin);
    */
    //@ts-ignore
    const stripe = Stripe('pk_test_51NPjKHElvUd6Cd58X0mtD30StUI2ugja89BsBuFmmBFAX4vswuAIy0w56rgd6VQwVz2aC42AQm3SvSeSuuZFqUug00QL7BuzzK')

    const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
    };

    // Set up Stripe.js and Elements to use in checkout form
    const elements = stripe.elements(options);

    // Create and mount the Payment Element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    /*
    const cardel = element.create()
    loadStripe('tc2yNFPJ9DYSmhNnf04vCUmbM3f MS94WK2w1YuhiTcxMIti8p3etufbrsr1oJpG2OUaLUmNUTU00cxAmOXLZ').then((val:any) =>{
      stripeStore.stripe = val 
      const elements = val.elements()
      const card = elements.create('card', {style: style})
    }
    )
    */

    const settStore = settingsStore()
    onMounted(() => {settStore.fetchSettings()})
</script>

<template>
  <form id="payment-form">
    <div id="payment-element">
      <!-- Elements will create form elements here -->
    </div>
    <button id="submit">Submit</button>
    <div id="error-message">
      <!-- Display error message to your customers here -->
    </div>
  </form>
</template>
