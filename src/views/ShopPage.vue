<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { RouterLink } from 'vue-router'
const paymentStore = usePaymentStore()

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center w-full">
                <div className="text-center font-semibold text-3xl">
                    Produkte wählen
                </div>
                <div className="flex place-items-center w-full">

                </div>
                <div className="place-items-center w-full h-full grid-rows-2">
                    <div class="w-full text-center text-xl font-semibold bg-black rounded-full text-white p-[6px] m-1">Print Zeitung 3€</div>
                    <div className="grid grid-cols-3 w-full h-1/2">
                        <button>
                            <div class="button-down bg-green-600"></div>
                        </button>
                        <input type="number" v-model.number="paymentStore.tip"
                            className="bg-green-600 text-white text-center text-2xl font-semibold rounded-full w-full h-full">
                        <button>
                            <div class="button-up bg-green-600 ml-3"></div>
                        </button>
                    </div>
                </div>
                <div className="flex place-items-center w-full">
                    <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
                        <RouterLink to="/custom-tip">Eingabe</RouterLink>
                    </button>
                </div>
                <div className="place-items-center row-span-2 w-full flex">
                    <RouterLink class="flex-none h-[76px] w-[76px] mr-2" to="/">
                        <button class="bg-green-600 fill-white rounded-full h-full w-full place-items-center grid">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="white"
                                class="bi bi-arrow-left-short" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                    d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
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
</component></template>