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
                    Zeitung kaufen <br>
                    1x Print Zeitung
                </div>
                <div className="py-9 w-full">
                    <p className="text-center text-8xl font-semibold">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div className="place-items-center row-span-2 w-full flex">
                    <RouterLink class="flex-none h-[76px] w-[76px] mr-3" to="/print-digital">
                        <button class="bg-green-600 fill-white rounded-full h-full text-white text-3xl w-full place-items-center grid">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"> <g> <path fill="none" d="M0 0h24v24H0z"/> <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"/> </g> </svg>
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
