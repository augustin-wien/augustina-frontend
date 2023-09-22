<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { settingsStore } from '@/stores/settingsStore';
import { RouterLink } from 'vue-router'
import { onMounted } from 'vue';
const paymentStore = usePaymentStore()
const settStore = settingsStore()
onMounted(settStore.fetchSettings)

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="grid grid-rows-5 h-full place-items-center w-full">
                <div className="text-center font-semibold text-xl">
                    Zeitung kaufen bei:
                    <div>
                        Theodor
                    </div>
                </div>
                <div class="place-items-center w-full flex">
                    <div class="text-xl grow h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full">
                        1x Print Zeitung
                    </div>
                </div>
                <div className="w-full row-span-2">
                    <p className="text-center text-8xl font-semibold">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div className="place-items-center w-full flex">
                <RouterLink class="text-center h-[76px] grow" to="/tipping">
                    <button class="bg-green-600 rounded-full p-5 text-white text-3xl w-full font-semibold">
                        Weiter
                    </button>
                </RouterLink>
            </div>
        </div>
    </template>
</component></template>
