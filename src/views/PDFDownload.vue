<script setup lang="ts">
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const pdfStore = usePDFDownloadStore()
const settStore = useSettingsStore()
const $route = useRoute()
const router = useRouter()

const pdfId = ref('')

onMounted(() => {
  const tmpId = $route.params.id

  if (Array.isArray(tmpId)) {
    pdfId.value = tmpId[0]
  } else {
    pdfId.value = tmpId
  }

  pdfStore.validatePDFDownload(pdfId.value).catch((error) => {
    // eslint-disable-next-line no-console
    console.log('PDF is invalid')
    // eslint-disable-next-line no-console
    console.log(error)
    router.push({ name: 'Error invalid link' })
  })
})

const downloadPDF = () => {
  pdfStore.downloadPDF(pdfId.value)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <h1 class="text-3xl my-6 font-bold">{{ $t('Pdf Download') }}</h1>
      <button
        class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
        :style="'background-color:' + settStore.settings.Color"
        @click="downloadPDF"
      >
        {{ $t('Download PDF') }}
      </button>
    </template>
  </component>
</template>
