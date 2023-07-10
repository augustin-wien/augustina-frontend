<script setup lang="ts">
    import { usePriceStore } from '@/stores/price'
    import { Payment } from '@/stores/PaymentStore'
    import { RouterLink} from 'vue-router'
    const priceStore = usePriceStore()
    const paymentStore = Payment()
</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Bezahlung bestätigen:
    </div>
    <div className="grid grid-cols-3 py-10 row-span-2 w-full">
        <p className="text-center text-9xl font-semibold col-span-3">{{ priceStore.price }}€</p>
    </div>
    <div>
        <input type="checkbox" id="checkbox" v-model="paymentStore.agbChecked"/>
        <label for="checkbox"> Mit Kauf aktzeptiere ich die <RouterLink to="/" class="text-blue-600">AGBs</RouterLink></label>
    </div>
    <div className="flex place-items-center w-full">
        <RouterLink class="bg-gray-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full" :class="{'bg-green-600': paymentStore.agbChecked}" to="/Payment">
            Weiter
        </RouterLink>
    </div>
  </main>
</template>@/stores/settingsStore@/stores/PaymentStore@/stores/PaymentStore@/stores/PaymentStore