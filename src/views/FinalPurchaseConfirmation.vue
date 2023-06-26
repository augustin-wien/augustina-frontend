<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { settingsStore } from '@/stores/settings';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    const priceStore = usePriceStore()
    const settStore = settingsStore()
    onMounted(() => {settStore.fetchSettings()})

</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Kauf bestätigen
    </div>
    <div className="grid grid-cols-3 py-10 row-span-2 w-full">
        <p className="text-center text-9xl font-semibold col-span-3">{{ priceStore.price }}€</p>
    </div>
    <div>
        <input type="checkbox" id="checkbox"/>
        <label for="checkbox">Mit Kauf aktzeptiere ich die AGBs</label>
    </div>
    <div className="flex place-items-center row-span-2 w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/">Weiter</RouterLink>
        </button>
    </div>
  </main>
</template>