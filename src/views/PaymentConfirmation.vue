<template>
  <div class="vendor-overview flex flex-col items-center space-y-5 mt-6">
    <img class="" alt="Augustin logo" src="../assets/logo.svg" />
    <h2 class="text-3xl font-bold">Symbol zeigen</h2>
    <div class="vendor-credit text-6xl font-bold">
      <span class="amount-bought">1x</span
      ><span><img class="" alt="Titelblatt" src="../assets/logo.svg" /></span>
    </div>
    <div class="text-3xl font-oold">So erhalten Sie die Printversion:</div>
    <div class="vendor-number">Ausweisnummer: 123456789</div>
    <div>
      <span class="date">{{ currentDate() }} </span><span class="time"> um {{ time }}</span>
    </div>
    <button class="bg-green-500 rounded-full py-3 px-6 text-white font-bold">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
    console.log('hello')
    currentTime()
    UpdateTime()
  }, 1000)
}
UpdateTime()
</script>
