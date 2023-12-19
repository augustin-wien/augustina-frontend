<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'

const settStore = useSettingsStore()
const shopStore = useShopStore()
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div class="h-full w-full grid grid-rows-5 place-items-center">
        <div class="text-center font-semibold text-3xl">{{ $t('Items') }}:</div>
        <div class="w-full row-span-3">
          <div v-for="item in shopStore.amount" :key="item.item">
            <div
              v-if="item.quantity > 0"
              class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full mb-5"
            >
              {{ item.quantity }}x {{ shopStore.getName(item.item) }}
              {{ shopStore.getPriceInEuro(item.item) }}€
            </div>
          </div>
        </div>
        <div className="place-items-center w-full flex">
          <RouterLink class="h-[76px] w-[76px] mx-auto" :to="{ name: 'Confirmation' }">
            <button
              class="customcolor fill-white rounded-full h-full w-full place-items-center grid"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="white"
                class="bi bi-arrow-left-short"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                />
              </svg>
            </button>
          </RouterLink>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
}
</style>
