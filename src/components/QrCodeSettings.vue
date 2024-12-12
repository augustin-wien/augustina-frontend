<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import IconCross from '@/components/icons/IconCross.vue'

import QRCodeStyling from 'qr-code-styling'
import { onMounted, ref, watch } from 'vue'
import { getBase64ImageFromUrl } from '@/api/api'
import JSZip from 'jszip'
import type {
  BackgroundOptions,
  CornersDotOptions,
  CornerSquareOptions,
  DotsOptions,
  ImageOptions,
  QrCodeOptions
} from '@/models/qrcode'

const emit = defineEmits(['close', 'saveSettings'])

const settingsStore = useSettingsStore()
const currentQrCode = ref<QRCodeStyling | null>(null)

const dotsOptions = ref<DotsOptions | undefined>({
  color: '#000',
  type: 'dots',
  gradient: undefined
})

const backgroundOptions = ref<BackgroundOptions | undefined>({
  color: '#fff',
  gradient: undefined
})

const imageOptions = ref<ImageOptions | undefined>({
  hideBackgroundDots: false,
  imageSize: 0.5,
  crossOrigin: 'anonymous',
  margin: 10
})

const qrCodeOptions = ref<QrCodeOptions | undefined>({
  typeNumber: 0,
  mode: 'Byte',
  errorCorrectionLevel: 'H'
})

const cornerSquareOptions = ref<CornerSquareOptions | undefined>({
  type: 'dot',
  color: '#000'
})

const cornersDotOptions = ref<CornersDotOptions | undefined>({
  type: 'dot',
  color: '#000'
})

watch(
  () => dotsOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)

watch(
  () => backgroundOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)

watch(
  () => imageOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)

watch(
  () => qrCodeOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)

watch(
  () => cornerSquareOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)

watch(
  () => cornersDotOptions.value,
  () => {
    generateQRCode('test')
  },
  { deep: true }
)
let image: string | undefined = undefined


// Function to generate QR code only if the button is clicked
const generateQRCode = async (venndorId: string) => {
  const logoUrl = settingsStore.settings.QRCodeLogoImgUrl

  if (image === undefined && logoUrl && logoUrl !== '' && settingsStore.settings.QRCodeEnableLogo) {
    const result = await getBase64ImageFromUrl(settingsStore.settings.QRCodeLogoImgUrl)
    if (result) image = result
  }

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: 'canvas',
    data: `${settingsStore.settings.QRCodeUrl}/v/${venndorId}`,
    image: image,

    dotsOptions: dotsOptions.value,
    backgroundOptions: backgroundOptions.value,
    imageOptions: imageOptions.value,
    cornersSquareOptions: cornerSquareOptions.value,
    cornersDotOptions: cornersDotOptions.value,
    qrOptions: qrCodeOptions.value
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

  return canvas
}

const save = () => {
  if (currentQrCode.value) {
    currentQrCode.value.download({ name: 'test', extension: 'png' })
  }
}

async function generateAllQrCodesAsZip(zipName = 'qrCodes.zip', vendors: Vendor[]) {
  if (typeof JSZip === 'undefined') {
    return
  }

  const zip = new JSZip()

  vendors.forEach(async (vendor: Vendor) => {
    await generateQRCode(vendor.LicenseID)
    const raw = await currentQrCode.value?.getRawData()

    if (!raw) {
      return
    }

    zip.file(`${vendor.LicenseID}.png`, raw)

    //if last element, generate the zip file
    if (vendors.indexOf(vendor) === vendors.length - 1) {
      zip.generateAsync({ type: 'blob' }).then((blob) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = zipName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }
  })

  // Generate the ZIP file and trigger the download
}

const saveAll = async () => {
  const vendorStore = vendorsStore()
  await vendorStore.getVendors()
  generateAllQrCodesAsZip('qrCodes', vendorStore.vendors)
}

const saveSettings = () => {
  if (currentQrCode.value) {
    settingsStore.settings.QRCodeSettings = JSON.stringify({
      dotsOptions: dotsOptions.value,
      backgroundOptions: backgroundOptions.value,
      imageOptions: imageOptions.value,
      cornerSquareOptions: cornerSquareOptions.value,
      cornersDotOptions: cornersDotOptions.value,
      qrCodeOptions: qrCodeOptions.value
    })

    emit('saveSettings')
  }
}

onMounted(() => {
  generateQRCode('test')
  // Load the settings from the store
  const settings = settingsStore.settings.QRCodeSettings

  if (settings) {
    const parsedSettings = JSON.parse(settings)
    dotsOptions.value = parsedSettings.dotsOptions
    backgroundOptions.value = parsedSettings.backgroundOptions
    imageOptions.value = parsedSettings.imageOptions
    cornerSquareOptions.value = parsedSettings.cornerSquareOptions
    cornersDotOptions.value = parsedSettings.cornersDotOptions
    qrCodeOptions.value = parsedSettings.qrCodeOptions
  }
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
        <h2 class="text-center">{{ $t('QR-Code settings') }}</h2>
        <div class="p-5 wrapper">
          <div class="options pl-5">
            <div v-if="qrCodeOptions" class="qr-code-options">
              <div class>{{ $t('Error Correction Level') }}</div>
              <select v-model="qrCodeOptions.errorCorrectionLevel" class="px-5 py-2.5">
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="Q">Q</option>
                <option value="H">H</option>
              </select>
            </div>
            <div v-if="dotsOptions" class="dots-options">
              <div class="color">{{ $t('Dots Color') }}</div>
              <input v-model="dotsOptions.color" type="color" class="px-5 py-2.5" />
              <div class="type">{{ $t('Dots Type') }}</div>
              <select v-model="dotsOptions.type" class="px-5 py-2.5">
                <option value="dots">{{ $t('Dots') }}</option>
                <option value="rounded">{{ $t('Rounded') }}</option>
                <option value="classy">{{ $t('Classy') }}</option>
                <option value="classy-rounded">{{ $t('Classy-Rounded') }}</option>
                <option value="square">{{ $t('Square') }}</option>
                <option value="extra-rounded">{{ $t('Extra-Rounded') }}</option>
              </select>
            </div>
            <div v-if="backgroundOptions" class="background-options">
              <div class="color">Background Color</div>
              <input v-model="backgroundOptions.color" type="color" class="px-5 py-2.5" />
            </div>
            <div v-if="cornerSquareOptions" class="corner-square-options">
              <div class="type">{{ $t('Corner Square Type') }}</div>
              <select v-model="cornerSquareOptions.type" class="px-5 py-2.5">
                <option value="square">{{ $t('Square') }}</option>
                <option value="dot">{{ $t('Dot') }}</option>
              </select>
            </div>
            <div v-if="cornersDotOptions" class="corner-dots-options">
              <div class="type">{{ $t('Corner Dots Type') }}</div>
              <select v-model="cornersDotOptions.type" class="px-5 py-2.5">
                <option value="square">{{ $t('Square') }}</option>
                <option value="dot">{{ $t('Dot') }}</option>
              </select>
            </div>
            <div v-if="imageOptions" class="image-options">
              <div class="hide-background-dots">{{ $t('Hide Dots behind the logo') }}</div>
              <input
                v-model="imageOptions.hideBackgroundDots"
                type="checkbox"
                class="px-5 py-2.5"
              />
              <div class="image-size">{{ $t('Logo Size') }}</div>
              <input
                v-model="imageOptions.imageSize"
                step="0.1"
                min="0.1"
                max="0.7"
                type="number"
                class="px-5 py-2.5"
              />
              <div class="margin">{{ $t('Logo Margin') }}</div>
              <input v-model="imageOptions.margin" type="number" class="px-5 py-2.5" />
            </div>
          </div>
          <div class="pr-5">
            <div class="preview mb-5 text-xl font-bold text-gray-500 dark:text-gray-400">
              <div class="flex">
                <h2 class="pr-4">{{ `${$t('Test QR-Code')}` }}</h2>
                <button
                  type="button"
                  class="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                  @click="save()"
                >
                  {{ $t('Download test QR-Code') }}
                </button>
              </div>
              <div id="qr-wrapper"></div>
            </div>
          </div>
        </div>
        <div class="text-center p-4">
          <button
            type="button"
            class="text-white mr-4 customcolor focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
            @click="saveAll()"
          >
            {{ $t('Download QR-Code for all vendors') }}
          </button>
          <button
            type="button"
            class="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
            @click="saveSettings()"
          >
            {{ $t('Save QR-Code settings') }}
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
    width: 70vw;
    max-width: 800px;
  }
}
#qr-wrapper {
  margin: 50px 0px;
  #canvas {
    max-width: 100%;
  }
}
.wrapper {
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: space-between;
}
h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
