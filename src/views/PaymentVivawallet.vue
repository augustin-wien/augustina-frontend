<script setup lang="ts">
import { onMounted } from 'vue';
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import { useShopStore } from '@/stores/ShopStore';

const shopStore = useShopStore()
const paymentStore = usePaymentStore()
const settings = settingsStore()
const vendorStore = useVendorStore()

onMounted(() => {
  // Removes emty Entries
  shopStore.removeEmty()
  const items = shopStore.finalitems
  if (paymentStore.tip>0){
    items.push({
      item: paymentStore.tipItem,
      quantity: paymentStore.tip*100
    })
  }
  console.log(items)
  paymentStore.postOrder(items, 1, vendorStore.vendorid)
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

<style scoped>
.lds-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  } 
  .lds-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: v-bind(settings.settings.Color);
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
  
.customcolor{
    background-color: v-bind(settings.settings.Color);
}


</style>
