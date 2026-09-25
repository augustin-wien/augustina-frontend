<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'

import type QRCodeStyling from 'qr-code-styling'
import { onMounted, ref, watch } from 'vue'
import { qrLogo, vendorQrCode } from '@/utils/qrCode'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

const settingsStore = useSettingsStore()
const props = defineProps<{ vendor: Vendor }>()
const currentQrCode = ref<QRCodeStyling | null>(null)

const emit = defineEmits(['close'])

const generateQRCode = async (vendor: Vendor) => {
  const settings = settingsStore.settings
  const qrCode = vendorQrCode(vendor, settings, await qrLogo(settings))

  const qrWrapper = document.getElementById('qr-wrapper')

  if (qrWrapper !== null) {
    qrWrapper.innerHTML = ''
    qrCode.append(qrWrapper)
  }

  currentQrCode.value = qrCode
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
    size="lg"
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
/* QRCodeStyling renders an <svg> (type: 'svg') at a fixed 500x500 - without this it overflows
   the modal's content width instead of scaling down to fit. */
.qr-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
