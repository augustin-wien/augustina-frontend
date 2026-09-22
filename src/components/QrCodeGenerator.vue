<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'

import QRCodeStyling from 'qr-code-styling'
import { onMounted, ref, watch } from 'vue'
import { getBase64ImageFromUrl } from '@/api/api'
import type {
  DotsOptions,
  BackgroundOptions,
  ImageOptions,
  QrCodeOptions,
  CornerSquareOptions,
  CornersDotOptions
} from '@/models/qrcode'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

const settingsStore = useSettingsStore()
const props = defineProps<{ vendor: Vendor }>()
const currentQrCode = ref<QRCodeStyling | null>(null)

const emit = defineEmits(['close'])

// Function to generate QR code only if the button is clicked
const generateQRCode = async (vendor: Vendor) => {
  //  fetch image
  let image: string | undefined = undefined
  const logoUrl = settingsStore.settings.QRCodeLogoImgUrl

  if (logoUrl && logoUrl !== '' && settingsStore.settings.QRCodeEnableLogo) {
    const result = await getBase64ImageFromUrl(settingsStore.settings.QRCodeLogoImgUrl)
    if (result) image = result
  }

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
    imageSize: 1,
    crossOrigin: 'anonymous',
    margin: 2
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

  if (settingsStore.settings.QRCodeSettings) {
    try {
      const parsedSettings = JSON.parse(settingsStore.settings.QRCodeSettings)
      dotsOptions.value = parsedSettings.dotsOptions
      backgroundOptions.value = parsedSettings.backgroundOptions
      imageOptions.value = parsedSettings.imageOptions
      cornerSquareOptions.value = parsedSettings.cornerSquareOptions
      cornersDotOptions.value = parsedSettings.cornersDotOptions
      qrCodeOptions.value = parsedSettings.qrCodeOptions
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Invalid QRCodeSettings JSON, falling back to defaults', err)
    }
  }

  const qrCode = new QRCodeStyling({
    width: 500,
    height: 500,
    type: 'svg',
    data: `${settingsStore.settings.QRCodeUrl}/v/${vendor.LicenseID}`,
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
}

const save = () => {
  if (currentQrCode.value) {
    currentQrCode.value.download({ name: props.vendor.LicenseID, extension: 'png' })
  }
}

watch(
  () => props.vendor,
  (vendor) => {
    generateQRCode(vendor)
  }
)

onMounted(() => {
  generateQRCode(props.vendor)
})
</script>

<template>
  <Modal
    open
    :title="`${$t('Qr-Code for')} ${vendor.FirstName} ${vendor.LastName}`"
    @close="emit('close')"
  >
    <div class="qr-preview">
      <div id="qr-wrapper"></div>
    </div>
    <template #footer>
      <Button variant="primary" @click="save()">{{ $t('Save Qr-Code') }}</Button>
    </template>
  </Modal>
</template>

<style scoped>
.qr-preview {
  display: flex;
  justify-content: center;
}
.qr-preview :deep(#canvas) {
  max-width: 100%;
}
</style>
