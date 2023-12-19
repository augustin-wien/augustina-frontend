<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { RouterLink } from 'vue-router'

const paymentStore = usePaymentStore()
const digital = paymentStore.epaper
const print = paymentStore.print
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-3xl">Ausgabe wählen</div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" to="/tipping">
            <button
              class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full"
              @click="digital"
            >
              E-Paper
            </button>
          </RouterLink>
        </div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" to="/tipping">
            <button
              class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full"
              @click="print"
            >
              Print
            </button>
          </RouterLink>
        </div>
        <div className="grid place-items-center row-span-2 w-full">
          <RouterLink class="grid place-items-center" to="/information">
            <button
              class="bg-green-600 rounded-full w-[76px] h-[76px] text-white text-4xl font font-semibold mx-auto"
            >
              ?
            </button>
          </RouterLink>
        </div>
      </div>
    </template>
  </component>
</template>
@/stores/useSettingsStore
