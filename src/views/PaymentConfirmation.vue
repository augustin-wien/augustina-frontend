<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="grid grid-rows-5 h-full place-items-center w-full">
        <div className="text-center font-semibold text-4xl">
          {{ $t("symbol") }}
        </div>
        <div class="row-span-2 text-6xl font-bold w-fit h-full relative">
          <div class="rounded-full absolute h-16 w-16 fill-white bg-green-600 right-0 top-0 place-items-center grid">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="45" height="45" viewBox="0 0 30 30">
              <path
                d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z">
              </path>
            </svg>
          </div>
          <img class="rounded-full h-56 w-56 object-cover customborder border-4" alt="Titelblatt"
            src="../assets/Titelseite.jpg">
        </div>
        <div class="grid grid-rows-2 place-items-center">
          <div><span class="date text-xl">{{ currentDate() }} </span><span class="time text-xl"> {{ $t("at") }} {{ time }}</span></div>
          <span class="date text-xl">{{ $t("bought") }} {{ formatTime(paymentStore.timeStamp) }}</span>
        </div>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { settingsStore } from '@/stores/settings'
import { usePaymentStore } from '@/stores/PaymentStore';

const paymentStore = usePaymentStore()
const settStore = settingsStore()

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

const formatTime = (date: string) =>{
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
.customcolor{
    background-color: v-bind(settStore.settings.Color);
}

.customborder{
  border-color: v-bind(settStore.settings.Color);
}
</style>