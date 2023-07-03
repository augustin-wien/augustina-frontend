<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    const priceStore = usePriceStore()
    const increment = priceStore.increment
    const decrement = priceStore.decrement
    const settStore = settingsStore()
    const settings = settStore.settings
    onMounted(() => {settStore.fetchSettings()})

</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        {{ (settStore.loaded)? settings[0].color : ''}}
    </div>
    <div className="grid grid-cols-5 py-10 row-span-2 w-full">
        <button @click="increment">+</button>
        <p className="text-center text-9xl font-semibold col-span-3">{{ priceStore.price }}€</p>
        <button @click="decrement">-</button>
    </div>
    <div className="flex place-items-center row-span-2 w-full">
        <RouterLink class="bg-green-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full" to="/print-digital" tag="button">Weiter</RouterLink>
    </div>
  </main>
</template>@/stores/settingsStore@/stores/settingsStore