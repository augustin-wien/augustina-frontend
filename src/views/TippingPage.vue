<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { RouterLink } from 'vue-router'
import { onMounted } from 'vue'
import { useShopStore } from '@/stores/ShopStore'

const settStore = settingsStore()
const paymentStore = usePaymentStore()
const shopStore = useShopStore()

const increment = paymentStore.setTip

onMounted(() => {
  shopStore.removeEmty()
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full w-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-3xl">
          {{ $t('donation') }}
        </div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
            <button
              class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full"
              @click="increment(2)"
            >
              2,00 €
            </button>
          </RouterLink>
        </div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
            <button
              class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full"
              @click="increment(1)"
            >
              1,00 €
            </button>
          </RouterLink>
        </div>
        <div className="flex place-items-center w-full">
          <button
            class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
          >
            <RouterLink :to="{ name: 'Custom Tip' }">{{ $t('edit') }}</RouterLink>
          </button>
        </div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
            <button
              class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
              @click="increment(0)"
            >
              {{ $t('notToday') }}
            </button>
          </RouterLink>
        </div>
      </div>
    </template>
  </component>
</template>

<style>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}
</style>
