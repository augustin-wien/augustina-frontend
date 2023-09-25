<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="grid grid-rows-5 h-full place-items-center w-full">
        <div className="text-center font-semibold text-4xl">
          Symbol zeigen
        </div>
        <div class="row-span-2 text-6xl font-bold">
          <img class="rounded-full object-cover h-48 w-48 border-green-600 border-4" alt="Titelblatt" :src="link" />
        </div>
        <div>
          <span class="date text-xl">{{ currentDate() }} </span><span class="time text-xl"> um {{ time }}</span>
        </div>
        <RouterLink class="w-full" to="/">
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
