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
            <div className="grid grid-rows-5 h-full place-items-center">
                <div className="text-center row-span-2 font-semibold text-3xl">
                    Zeitung kaufen
                </div>
                <div className="py-9 w-full">
                    <p className="text-center text-8xl font-semibold">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div className="place-items-center row-span-2 w-full flex">
                    <RouterLink class="flex-none h-[76px] w-[76px] mr-3" to="/print-digital">
                        <button class="bg-green-600 rounded-full h-full text-white text-3xl w-full place-items-center grid">
                            <svg class="fill-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/>
                            </svg>
                        </button>
                    </RouterLink>
                    <RouterLink class="text-center h-[76px] grow" to="/print-digital">
                        <button class="bg-green-600 rounded-full p-5 text-white text-3xl w-full font-semibold">
                            Weiter
                        </button>
                    </RouterLink>
                </div>
            </div>
        </template>
    </component>
</template>
