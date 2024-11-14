<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useShopStore } from '@/stores/ShopStore'

const router = useRouter()
const settStore = useSettingsStore()
const shopStore = useShopStore()

onMounted(() => {
  shopStore.setDonation(0)
})

const fixedDonationClick = (amount: number) => {
  shopStore.setDonation(amount * 100)
  router.push({ name: 'Confirmation' })
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full w-full grid grid-rows-5 place-items-center">
        <div>
          <div className="text-center font-semibold text-3xl">
            {{ $t('donation') }}
          </div>
          <div className="text-center font-semibold text-xl">
            {{ $t('for the vendor') }}
          </div>
        </div>

        <div className="flex place-items-center w-full">
          <button
            class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full"
            @click="fixedDonationClick(2)"
          >
            2,00 €
          </button>
        </div>
        <div className="flex place-items-center w-full">
          <button
            class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full"
            @click="fixedDonationClick(1)"
          >
            1,00 €
          </button>
        </div>
        <div className="flex place-items-center w-full">
          <button
            class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
          >
            <RouterLink :to="{ name: 'Custom Tip' }">{{ $t('editTip') }}</RouterLink>
          </button>
        </div>
        <div className="flex place-items-center w-full">
          <button
            class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
            @click="fixedDonationClick(0)"
          >
            {{ $t('notToday') }}
          </button>
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
