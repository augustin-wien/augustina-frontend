<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useShopStore } from '@/stores/ShopStore'
import { useSettingsStore } from '@/stores/settings'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

const settStore = useSettingsStore()
const shopStore = useShopStore()
const increment = shopStore.incrementDonation
const decrement = shopStore.decrementDonation
const donation = storeToRefs(shopStore).donation
const setDonation = shopStore.setDonation
const localDonation = ref(0)

onMounted(() => {
  shopStore.setDonation(100)
  localDonation.value = donation?.value ? donation.value / 100 : 0
})

watch(
  () => donation.value,
  () => {
    localDonation.value = donation?.value ? donation.value / 100 : 0
  }
)

const onlyForCurrency = ($event: any) => {
  const keycode = $event.keyCode ? $event.keyCode : $event.which

  // only allow number and one dot
  if (
    (keycode < 48 || keycode > 57) &&
    (keycode !== 46 || localDonation.value.toString().indexOf('.') !== -1)
  ) {
    $event.preventDefault()
    return
  }

  // restrict to 2 decimal places and 1 digit in integer part
  if (localDonation.value !== null && localDonation.value !== undefined) {
    const currentTip = localDonation.value.toString()
    const parts = currentTip.split('.')

    // Check total number of digits
    const totalDigits = currentTip.replace('.', '').length

    if (totalDigits >= 3 || (parts[0].length > 0 && parseInt(parts[0]) > 9)) {
      $event.preventDefault()
      return
    }

    if (parts.length > 1) {
      const decimalPart = parts[1]

      // prevent more than two decimal places
      if (decimalPart.length >= 2) {
        $event.preventDefault()
        return
      }
    }
  }
}

const roundValue = () => {
  if (localDonation.value !== null && localDonation.value !== undefined) {
    // Convert to number, round to two decimal places, and then convert back to a string
    const cleanedDonation = parseFloat(Number(localDonation.value).toFixed(2))
    setDonation(cleanedDonation * 100)
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div id="custom-tip-page" className="h-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-3xl row-span-2">
          {{ $t('customdonation') }}
        </div>
        <div className="grid grid-cols-5 w-full h-full">
          <button @click="decrement()" id="decrement-btn">
            <div class="button-down customcolor"></div>
          </button>
          <div
            id="donation-input-wrapper"
            class="col-span-3 grid grid-cols-3 customcolor bg-opacity-0 text-white rounded-3xl border-spacing-7 place-items-center"
          >
            <input
              v-model.number="localDonation"
              type="number"
              class="customcolor col-span-2 text-white text-center text-6xl font-semibold border-2 customborder rounded-3xl w-full h-full"
              @keypress="onlyForCurrency"
            />
            <p className="text-6xl font-semibold text-left">€</p>
          </div>
          <button id="increment-btn" @click="increment">
            <div class="button-up customcolor ml-3"></div>
          </button>
        </div>
        <div></div>
        <div className="flex place-items-center w-full">
          <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
            <button
              id="next-button"
              class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full"
              @click="roundValue"
            >
              {{ $t('next') }}
            </button>
          </RouterLink>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.button-up,
.button-down {
  position: relative;
  padding: 5px;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  transition: all 0.2s linear;
}

.button-down {
  margin-right: auto;
}

.button-up {
  margin-left: auto;
}

.button-up::after,
.button-down::after {
  content: '';
  position: absolute;
  left: 15px;
  z-index: 11;
  display: block;
  width: 20px;
  height: 20px;
  border-top: 2px solid v-bind(settStore.settings.FontColor);
  border-left: 2px solid v-bind(settStore.settings.FontColor);
}

.button-up::after {
  top: 20px;
  transform: rotate(45deg);
}

.button-down::after {
  top: 10px;
  transform: rotate(225deg);
}

.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}

.customborder {
  border-color: v-bind(settStore.settings.Color);
}
</style>
