<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'
import IconCross from '@/components/icons/IconCross.vue'

import QRCodeStyling from 'qr-code-styling'
import { onMounted, ref, watch } from 'vue'
import { getBase64ImageFromUrl } from '@/api/api'

const settingsStore = useSettingsStore()
const props = defineProps(['vendor'])
const vendor = props.vendor
const currentQrCode = ref<QRCodeStyling | null>(null)

// Function to generate QR code only if the button is clicked
const generateQRCode = async (vendor: Vendor) => {
  //  fetch image
  let image: string | undefined = undefined
  const logoUrl = settingsStore.settings.QRCodeLogoImgUrl

  if (logoUrl && logoUrl !== '' && settingsStore.settings.QRCodeEnableLogo) {
    const result = await getBase64ImageFromUrl(settingsStore.settings.QRCodeLogoImgUrl)
    if (result) image = result
  }

  const qrCode = new QRCodeStyling({
    width: 500,
    height: 500,
    type: 'svg',
    data: `${settingsStore.settings.QRCodeUrl}/v/${vendor.LicenseID}`,
    image: image,

    dotsOptions: {
      color: '#000',
      type: 'dots'
    },
    backgroundOptions: {
      color: '#fff'
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 2
    },
    cornersSquareOptions: {
      type: 'dot',
      color: '#000000'
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#000000'
    },
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'H'
    }
  })

  const qrWrapper = document.getElementById('qr-wrapper')

  if (qrWrapper !== null) {
    qrWrapper.innerHTML = ''
    qrCode.append(qrWrapper)
  }

  const canvas = document.getElementById('canvas')
  currentQrCode.value = qrCode

  if (canvas !== null) {
    qrCode.append(canvas)
    canvas.innerHTML = ''
  }
}

const save = () => {
  if (currentQrCode.value) {
    currentQrCode.value.download({ name: vendor.LicenseID, extension: 'png' })
  }
}

watch(
  () => props.vendor,
  (vendor) => {
    generateQRCode(vendor)
  }
)

onMounted(() => {
  generateQRCode(vendor)
})
</script>

<template>
  <div
    id="qrcode-modal"
    tabindex="-1"
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full modal-content max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex place-content-center justify-between pt-4 pr-4">
          <span />
          <button class="rounded-full bg-red-600 text-white font-bold" @click="$emit('close')">
            <IconCross />
          </button>
        </div>
        <div class="p-4 md text-center">
          <div class="mb-5 text-xl font-bold text-gray-500 dark:text-gray-400">
            <h2>{{ `${$t('Qr-Code for')} ${vendor.FirstName} ${vendor.LastName}` }}</h2>
            <div id="qr-wrapper"></div>
          </div>
          <button
            type="button"
            class="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
            @click="save()"
          >
            {{ $t('Save Qr-Code') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#qrcode-modal {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  top: 0;
  left: 0;
  width: 100vw;
  background-color: #00000080;
  justify-content: center;
  align-items: center;
  .modal-content {
    width: 600px;
  }
}
#qr-wrapper {
  margin: 50px 0px;
  #canvas {
    max-width: 100%;
  }
}
</style>
