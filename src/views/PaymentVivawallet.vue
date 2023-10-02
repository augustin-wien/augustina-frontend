<script setup lang="ts">
import { onMounted } from 'vue';
import { usePaymentStore } from '@/stores/PaymentStore'
import { settingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'


const paymentStore = usePaymentStore()
const settings = settingsStore()
const vendorStore = useVendorStore()

onMounted(() => {
  // todo add multiple items
  paymentStore.postOrder(settings.settings.MainItem, 1, vendorStore.vendorid)
})
</script> 

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main className="h-full grid grid-rows-6 place-items-center">
        <div class="lds-ellipsis row-span-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </main>
    </template>
  </component>
</template>

<style scoped>@import "../assets/loadingwheel.css"
.customcolor{
    background-color: v-bind(settings.settings.Color);
}


</style>