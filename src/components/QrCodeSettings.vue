<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'

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
import Card from '@/components/ui/Card.vue'
import FormField from '@/components/ui/FormField.vue'
import Button from '@/components/ui/Button.vue'

const emit = defineEmits(['saveSettings'])

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

  if (qrWrapper) {
    qrWrapper.innerHTML = ''
  } else {
    return
  }

  qrCode.append(qrWrapper)

  currentQrCode.value = qrCode

  return qrCode
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
    const code = await generateQRCode(vendor.LicenseID)
    if (!code) return
    const raw = await code.getRawData()

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
  <Card>
    <div class="qr-layout">
      <div class="qr-options">
        <FormField v-if="qrCodeOptions" :label="$t('Error Correction Level')">
          <select v-model="qrCodeOptions.errorCorrectionLevel" class="aug-input">
            <option value="L">L</option>
            <option value="M">M</option>
            <option value="Q">Q</option>
            <option value="H">H</option>
          </select>
        </FormField>
        <template v-if="dotsOptions">
          <FormField :label="$t('Dots Color')">
            <input v-model="dotsOptions.color" type="color" class="aug-input color-input" />
          </FormField>
          <FormField :label="$t('Dots Type')">
            <select v-model="dotsOptions.type" class="aug-input">
              <option value="dots">{{ $t('Dots') }}</option>
              <option value="rounded">{{ $t('Rounded') }}</option>
              <option value="classy">{{ $t('Classy') }}</option>
              <option value="classy-rounded">{{ $t('Classy-Rounded') }}</option>
              <option value="square">{{ $t('Square') }}</option>
              <option value="extra-rounded">{{ $t('Extra-Rounded') }}</option>
            </select>
          </FormField>
        </template>
        <FormField v-if="backgroundOptions" :label="$t('Background Color')">
          <input v-model="backgroundOptions.color" type="color" class="aug-input color-input" />
        </FormField>
        <FormField v-if="cornerSquareOptions" :label="$t('Corner Square Type')">
          <select v-model="cornerSquareOptions.type" class="aug-input">
            <option value="square">{{ $t('Square') }}</option>
            <option value="dot">{{ $t('Dot') }}</option>
          </select>
        </FormField>
        <FormField v-if="cornersDotOptions" :label="$t('Corner Dots Type')">
          <select v-model="cornersDotOptions.type" class="aug-input">
            <option value="square">{{ $t('Square') }}</option>
            <option value="dot">{{ $t('Dot') }}</option>
          </select>
        </FormField>
        <template v-if="imageOptions">
          <label class="aug-toggle">
            <input v-model="imageOptions.hideBackgroundDots" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('Hide Dots behind the logo') }}</span>
          </label>
          <FormField :label="$t('Logo Size')">
            <input
              v-model="imageOptions.imageSize"
              step="0.1"
              min="0.1"
              max="0.7"
              type="number"
              class="aug-input"
            />
          </FormField>
          <FormField :label="$t('Logo Margin')">
            <input v-model="imageOptions.margin" type="number" class="aug-input" />
          </FormField>
        </template>
      </div>
      <div class="qr-preview">
        <div class="preview-header">
          <h3 class="preview-title">{{ $t('Test QR-Code') }}</h3>
          <Button variant="secondary" @click="save()">{{ $t('Download test QR-Code') }}</Button>
        </div>
        <div id="qr-wrapper"></div>
      </div>
    </div>
    <div class="qr-actions">
      <Button variant="secondary" @click="saveAll()">
        {{ $t('Download QR-Code for all vendors') }}
      </Button>
      <Button variant="primary" @click="saveSettings()">{{ $t('Save QR-Code settings') }}</Button>
    </div>
  </Card>
</template>

<style scoped>
.qr-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.qr-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 240px;
}
.color-input {
  height: 38px;
  padding: 2px;
}
.qr-preview {
  flex: 1;
  min-width: 260px;
}
.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.preview-title {
  font-size: 15px;
  font-weight: 700;
}
#qr-wrapper :deep(canvas) {
  max-width: 100%;
}
.qr-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 24px;
}
</style>
