<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { RouterLink } from 'vue-router'
const paymentStore = usePaymentStore()

const increment = paymentStore.incrementTipC

const namelist = [
    {
        "ID": 1,
        "Name": "Zeitung",
        "Description": "Aktuelle Zeitungsausgabe",
        "Price": 300,
        "Image": "",
        "LicenseItem": null,
        "Archived": false,
        "IsLicenseItem": false
    },
    {
        "ID": 4,
        "Name": "Digitale Zeitung (Lizenz)",
        "Description": "Lizenz für digitale Zeitungsausgabe",
        "Price": 50,
        "Image": "",
        "LicenseItem": null,
        "Archived": false,
        "IsLicenseItem": false
    },
    {
        "ID": 5,
        "Name": "Digitale Zeitung",
        "Description": "Digitale Zeitungsausgabe",
        "Price": 300,
        "Image": "",
        "LicenseItem": 4,
        "Archived": false,
        "IsLicenseItem": false
    },
    {
        "ID": 6,
        "Name": "Kalender",
        "Description": "Kalender für das Jahr 2024",
        "Price": 800,
        "Image": "",
        "LicenseItem": null,
        "Archived": false,
        "IsLicenseItem": false
    }
]

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center w-full">
                <div class="row-span-4 h-full">
                    <div className="text-center font-semibold text-3xl py-4">
                        Produkte wählen
                    </div>
                    <div class="h-5/6 pb-3">
                        <ul class="list-image-none overflow-y-auto h-full bg-gray-200 border border-gray-600 rounded-3xl">
                            <li v-for="item in namelist" class="flex">
                                <div class="h-[80px] w-[80px] flex-none bg-red-600 rounded-2xl">
                                    
                                </div>
                                <div
                                    className="place-items-center grow h-full p-1 grid grid-rows-2 border-b-gray-400 border-2">
                                    <div class="w-full h-full py-1">
                                        <div
                                            class="bg-black h-16 w-full rounded-full text-center text-white font-semibold text-xl flex justify-center items-center">
                                            {{ item.Name }}€
                                        </div>
                                    </div>
                                    <div className="flex grow h-full pb-3 w-full">

                                        <div class="bg-green-600 text-white text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1">
                                            <div>
                                                1x
                                            </div>
                                        </div>
                                        <button>
                                            <div
                                                class="button-down bg-green-600 h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]">
                                                -</div>
                                        </button>
                                        <button class="place-content-">
                                            <div
                                                class="button-up bg-green-600 h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]">
                                                +</div>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
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
    </component>
</template>