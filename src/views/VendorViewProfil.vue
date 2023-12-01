<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="vendor-overview container mb-8 space-y-40 pb-3 w-5/6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">{{ $t('yourData') }}</h1>
          <div class="information">
            <div class="grid grid-cols-2 place-content-between">
              <strong>Name:</strong>
              {{ vendorMe?.FirstName }} {{ vendorMe?.LastName }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>{{ $t('IDNumber') }}:</strong> {{ vendorMe?.LicenseID }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>Email: </strong>{{ vendorMe?.Email }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong> {{ $t('telephone') }}: </strong>{{ vendorMe?.Telephone }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>{{ $t('location') }}: </strong>{{ vendorMe?.Location }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>{{ $t('postCode') }}:</strong> {{ vendorMe?.PLZ }}
            </div>
          </div>
          <button
            @click="router.push('/me')"
            class="px-2 rounded-full bg-red-600 text-white font-bold"
          >
            {{ $t('back') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import router from '@/router'

const store = vendorsStore()

const vendorMe = ref<Vendor | null>(null)

onMounted(async () => {
  try {
    vendorMe.value = await store.fetchVendorMe()
  } catch (error) {
    console.error('Fehler beim API-Aufruf:', error)
  }
})
</script>

<style>
.vendor-overview {
  display: flex;
  flex-direction: column;
}

h2 {
  font-size: large;
}
.container {
  max-width: 300px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.information {
  text-align: start;
}
</style>
