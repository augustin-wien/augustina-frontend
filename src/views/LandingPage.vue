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
                <div className="text-center row-span-2 font-semibold text-4xl">
                    Zeitung kaufen
                </div>
                <div className="py-9 w-full">
                    <p className="text-center text-9xl font-semibold">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div className="flex place-items-center row-span-2 w-full">
                    <RouterLink class="text-center w-full" to="/print-digital">
                        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold">
                            Weiter
                        </button>
                    </RouterLink>
                </div>
            </div>
        </template>
    </component>
</template>
