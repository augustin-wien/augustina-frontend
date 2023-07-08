<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { settingsStore } from '@/stores/settingsStore';
    import { RouterLink} from 'vue-router'
    import { onMounted } from 'vue'

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
          Payment
      </div>
      <div className="grid grid-cols-5 py-10 row-span-2 w-full">
          <button>+</button>
          <p className="text-center text-9xl font-semibold col-span-3">69€</p>
          <button>-</button>
      </div>
      <div className="flex place-items-center row-span-2 w-full">
          <RouterLink class="bg-green-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full" to="/print-digital">Weiter</RouterLink>
      </div>
    </main>
</template>@/stores/settingsStore@/stores/settingsStore