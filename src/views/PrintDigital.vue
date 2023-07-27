<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    const paymentStore = usePaymentStore()
    const digital = paymentStore.epaper
    const print = paymentStore.print
    const settStore = settingsStore()
</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Ausgabe wählen
    </div>
    <div className="flex place-items-center w-full">
        <button @click="digital" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/additionalproducts">ePaper</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center w-full">
        <button @click="print" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/additionalproducts">Print</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center row-span-2 w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold mx-auto w-20">
            <RouterLink to="/">?</RouterLink>
        </button>
    </div>
  </main>
</template>@/stores/settingsStore