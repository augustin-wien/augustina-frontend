<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { RouterLink} from 'vue-router'

    const paymentStore = usePaymentStore()
    
    const increment = paymentStore.increment
    const decrement = paymentStore.decrement

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
            <button @click="decrement()">
                <div class="button-down bg-green-600"></div>
            </button>
            <div class="col-span-3 grid grid-cols-3 bg-green-500 text-white rounded-3xl border-spacing-7 place-items-center">
                <input type="number" v-model.number="paymentStore.tip" className="bg-green-600 col-span-2 text-white text-center text-6xl font-semibold border-2 border-green-600 rounded-3xl w-full h-full">
                <p className="text-6xl font-semibold text-left">€</p>
            </div>
            <button @click="increment">
                <div class="button-up bg-green-600 ml-3"></div>
            </button>
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

<style scoped>
  @import "../assets/arrows.css"
</style>