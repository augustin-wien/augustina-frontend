<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { RouterLink} from 'vue-router'

    const paymentStore = usePaymentStore()
    
    const increment = paymentStore.incrementTipC
    const decrement = paymentStore.decrementTipC

</script>

<template>
    <main className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
        <header >
            <img alt="Augustin logo" className="logo mx-auto my-2" src="@/assets/logo.svg" width="270" height="150"/>
        </header>
        <div className="text-center font-semibold text-4xl row-span-2">
            Trinkgeld eingeben:
        </div>
        <div className="grid grid-cols-5 w-full h-full">
            <button @click="increment(0.5)">+</button>
            <div class="col-span-3 grid grid-cols-3 bg-green-200 rounded-3xl border-spacing-7 place-items-center border-4 border-green-600">
                <input v-model="paymentStore.tip" className="bg-green-300 col-span-2 text-center text-7xl font-semibold rounded-3xl w-full h-full">
                <p className="text-7xl font-semibold text-left">€</p>
            </div>
            <button @click="decrement(0.5)">-</button>
        </div>
        <div>

        </div>
        <div className="flex place-items-center w-full">
            <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                <RouterLink to="/confirmation">Weiter</RouterLink>
            </button>
        </div>
    </main>
</template>
