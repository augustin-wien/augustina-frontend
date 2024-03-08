<script setup lang="ts">
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'

const pdfStore = usePDFDownloadStore()
const settStore = useSettingsStore()
const $route = useRoute()
const router = useRouter()

onMounted(() => {
  const pdfId = $route.params.id
  pdfStore
    .validatePDFDownload(pdfId)
    .then((response) => {
      if (response.status === 200) {
      }
    })
    .catch((error) => {
      console.log('PDF is invalid')

      console.log(error)
      router.push({ name: 'Error invalid link' })
    })
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <h1 class="text-3xl my-6 font-bold">{{ $t('Pdf Download') }}</h1>
      <button
        @click="pdfStore.downloadPDF($route.params.id)"
        class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
        :style="'background-color:' + settStore.settings.Color"
      >
        {{ $t('Download PDF') }}
      </button>
    </template>
  </component>
</template>
