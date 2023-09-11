<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { RouterLink } from 'vue-router'
const paymentStore = usePaymentStore()
const digital = paymentStore.epaper
const print = paymentStore.print

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-4xl">
                    Ausgabe wählen
                </div>
                <div className="flex place-items-center w-full">
                    <button @click="digital"
                        class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/additionalproducts">E-Paper</RouterLink>
                    </button>
                </div>
                <div className="flex place-items-center w-full">
                    <button @click="print"
                        class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/additionalproducts">Print</RouterLink>
                    </button>
                </div>
                <div className="flex place-items-center row-span-2 w-full">
                    <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold mx-auto w-20">
                        <RouterLink to="/information">?</RouterLink>
                    </button>
                </div>
            </div>
        </template>
</component></template>@/stores/settingsStore