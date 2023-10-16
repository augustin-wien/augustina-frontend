<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="grid grid-rows-5 h-full place-items-center w-full">
        <div className="h-full w-full text-center grid grid-rows-2 font-semibold text-xl">
          <div>{{ $t("symbol") }}</div>
          <div>{{ paymentStore.firstName }}</div>
        </div>
        <div class="row-span-2 text-6xl font-bold w-fit h-full relative">
          <div class="rounded-full absolute h-12 w-12 fill-white right-0 top-0 place-items-center grid" :class="{ 'bg-red-600': isConfirmed, 'bg-green-600': !isConfirmed}">
            <IconCheckmark v-if="!isConfirmed"/>
            <IconCross v-else/>
          </div>
          <img class="rounded-full h-44 w-44 object-cover customborder border-4" alt="Titelblatt"
            src="../assets/Titelseite.jpg">
        </div>
        <div class="grid grid-rows-2 place-items-center">
          <div><span class="date text-xl">{{ currentDate() }} </span><span class="time text-xl"> {{ $t("at") }} {{ time
          }}</span></div>
          <span class="date text-xl">{{ $t("bought") }} {{ formatTime(paymentStore.timeStamp) }}</span>
        </div>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { settingsStore } from '@/stores/settings'
import { usePaymentStore } from '@/stores/PaymentStore'
import IconCheckmark from '@/components/icons/Checkmark.vue'
import IconCross from '@/components/icons/Cross.vue'

const paymentStore = usePaymentStore()
const settStore = settingsStore()

const isConfirmed = ref(paymentStore.timeStamp == "")

function currentDate() {
  const current = new Date()
  const date = `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`
  return date
}
let time = ref('not')
function currentTime() {
  const now = new Date()
  time.value = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

const formatTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

function UpdateTime() {
  setTimeout(() => {
    currentTime()
    UpdateTime()
  }, 1000)
}
UpdateTime()

</script>

<style>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
}

.customborder {
  border-color: v-bind(settStore.settings.Color);
}
</style>