<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore';
import { settingsStore } from '@/stores/settings'
import { computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
const vendorStore = useVendorStore()
const settStore = settingsStore()
const fetch = settStore.getSettingsFromApi
const price = computed(() => settStore.settings.MainItemPrice / 100)
watch(price, () => {
    usePaymentStore().setPrice(settStore.settings.MainItemPrice)
    usePaymentStore().setPricePerPaper(settStore.settings.MainItemPrice)
})
onMounted(() => fetch())

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <select
            class="h-[55px] w-[55px] absolute font-light border-2 top-0 right-0 border-gray-300 rounded-full text-gray-300 text-center mt-8 mr-4 text-sm"
            v-model="$i18n.locale">
            <option value="en">EN</option>
            <option value="de">DE</option>
        </select>
        <template #main v-if="settStore.settings.MainItemPrice">
            <div className="grid grid-rows-5 h-full place-items-center w-full">
                <div class="row-span-2 grid grid-rows-3 h-full w-full">
                    <div className="text-center font-semibold text-2xl pt-5">
                        {{ $t("buyItem") }}
                    </div>
                    <div class="flex place-content-center">
                        <div class="text-center min-w-fit h-4/5 text-4xl rounded-full text-black font-bold">
                            {{ vendorStore.vendorName }}
                        </div>
                    </div>
                    <div class="place-items-center w-full flex">
                        <div class="text-2xl grow h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full">
                            1x {{ $t("newspaper") }}
                        </div>
                    </div>
                </div>
                <div className="w-full row-span-2">
                    <p className="text-center text-8xl font-semibold">{{ price }}€</p>
                </div>
                <div className="place-items-center w-full flex">
                    <RouterLink class="text-center h-[76px] grow" :to="{ name: 'Tippingpage' }">
                        <button
                            class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold">
                            {{ $t("next") }}
                        </button>
                    </RouterLink>
                </div>
            </div>
            <div class="absolute">

            </div>
        </template>
    </component>
</template>

<style scoped>
.customcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>
