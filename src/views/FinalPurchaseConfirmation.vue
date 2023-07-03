<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'
    const priceStore = usePriceStore()
    const settStore = settingsStore()
    onMounted(() => {settStore.fetchSettings()})
    var agbschecked: boolean
</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        {{ agbschecked }}
    </div>
    <div className="grid grid-cols-3 py-10 row-span-2 w-full">
        <p className="text-center text-9xl font-semibold col-span-3">{{ priceStore.price }}€</p>
    </div>
    <div>
        <input type="checkbox" id="checkbox" v-model="agbschecked"/>
        <label for="checkbox"> Mit Kauf aktzeptiere ich die <RouterLink to="/" class="text-blue-600">AGBs</RouterLink></label>
    </div>
    <div className="flex place-items-center w-full">
        <RouterLink class="bg-gray-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full" to="/" tag="button">Weiter</RouterLink>
    </div>
  </main>
</template>@/stores/settingsStore