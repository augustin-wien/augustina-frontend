<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { RouterLink } from 'vue-router'
const paymentStore = usePaymentStore()

const increment = paymentStore.incrementTipC

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-4xl">
                    Trinkgeld geben
                </div>
                <div className="flex place-items-center w-full">
                    <button @click="increment(1)"
                        class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/confirmation">1,00 €</RouterLink>
                    </button>
                </div>
                <div className="flex place-items-center w-full">
                    <button @click="increment(0.5)"
                        class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/confirmation">0,50 €</RouterLink>
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
            </div>
        </template>
</component></template>