<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { settingsStore } from '@/stores/settings';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    const priceStore = usePriceStore()
    const digital = priceStore.epaper
    const print = priceStore.print
    const settStore = settingsStore()
    onMounted(() => {settStore.fetchSettings()})

</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Ausgabe wählen
    </div>
    <div className="flex place-items-center w-full">
        <button @click="digital" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/">ePaper</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center w-full">
        <button @click="print" class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/">Print</RouterLink>
        </button>
    </div>
    <div className="flex place-items-center row-span-2 w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold mx-auto w-20">
            <RouterLink to="/">?</RouterLink>
        </button>
    </div>
  </main>
</template>