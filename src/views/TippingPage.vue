<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { RouterLink} from 'vue-router'
    const paymentStore = usePaymentStore()

    const increment = paymentStore.incrementTipC

</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Trinkgeld geben
    </div>
    <div className="flex place-items-center w-full">
        <button @click="increment(0.5)" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/confirmation">0,50 €</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center w-full">
        <button @click="increment(1)" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/confirmation">1,00 €</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/custom-tip">Eigener Betrag</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/confirmation">Heute nicht</RouterLink>
        </button>
    </div>
  </main>
</template>