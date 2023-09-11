<template>
  <component :is="$route.meta.layout || 'div'">
      <template #main>
          <div className="grid grid-rows-5 h-full place-items-center">
              <div className="text-center font-semibold text-4xl">
                  Symbol zeigen
              </div>
              <div class="row-span-2 text-6xl font-bold">
                <img class="rounded-full object-cover h-60 w-60" alt="Titelblatt" :src="link" />
              </div>
              <div>
                <span class="date text-3xl">{{ currentDate() }} </span><span class="time text-3xl"> um {{ time }}</span>
              </div>
              <div className="flex place-items-center w-full">
                  <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                      <RouterLink to="/print-digital">Logout</RouterLink>
                  </button>
              </div>
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
