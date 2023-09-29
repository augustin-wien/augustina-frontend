<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="grid grid-rows-5 h-full place-items-center w-full">
        <div className="text-center font-semibold text-4xl">
          Symbol zeigen
        </div>
        <div class="row-span-2 text-6xl font-bold w-fit h-full relative">
          <div class="rounded-full absolute h-16 w-16 fill-white bg-green-600 right-0 top-0 place-items-center grid">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="45" height="45" viewBox="0 0 30 30">
              <path
                d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z">
              </path>
            </svg>
          </div>
          <img class="rounded-full h-full w-[179px] object-cover border-green-600 border-4" alt="Titelblatt"
            src="../assets/Titelseite.jpg">
        </div>
        <div>
          <span class="date text-xl">{{ currentDate() }} </span><span class="time text-xl"> um {{ time }}</span>
        </div>
        <RouterLink class="w-full" :to="{ name: 'LandingPage' }">
          <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
            Start
          </button>
        </RouterLink>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { ref } from 'vue'
let link = import.meta.env.VITE_AUGUSTIN_COVER

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

function UpdateTime() {
  setTimeout(() => {
    currentTime()
    UpdateTime()
  }, 1000)
}
UpdateTime()
</script>
