<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore';
import { RouterLink } from 'vue-router';
const paymentStore = usePaymentStore()

const increment = paymentStore.incrementTipC

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full w-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-3xl">
                    Spende geben
                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="increment(1)"
                            class="bg-green-600 rounded-full p-[18px] text-white text-4xl font font-semibold w-full">
                            1,00 €
                        </button>
                    </RouterLink>
                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="increment(0.5)"
                            class="bg-green-600 rounded-full p-[18px] text-white text-4xl font font-semibold w-full">
                            0,50 €
                        </button>
                    </RouterLink>
                </div>
                <div className="flex place-items-center w-full">
                    <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
                        <RouterLink :to="{ name: 'Custom Tip' }">Eingabe</RouterLink>
                    </button>
                </div>
                <div className="flex place-items-center w-full">
                    <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
                        <RouterLink :to="{ name: 'Confirmation' }">Heute nicht</RouterLink>
                    </button>
                </div>
            </div>
        </template>
    </component>
</template>