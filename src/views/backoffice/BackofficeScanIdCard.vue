<script setup lang="ts">
import axios from 'axios'
import type QrScanner from 'qr-scanner'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { faCamera, faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { scanVendorIdCard } from '@/api/api'
import { useSettingsStore } from '@/stores/settings'
import { licenseIdFromScan } from '@/utils/idCardScan'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const { t } = useI18n()
const settingsStore = useSettingsStore()
const idScanEnabled = computed(() => settingsStore.settings.IDScanEnabled)

const input = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const busy = ref(false)
const error = ref('')

const cameraOn = ref(false)
const cameraStarting = ref(false)
let scanner: QrScanner | null = null
// The camera keeps decoding the card in front of it, so the same code is only looked up
// again after a pause - e.g. to retry after an error
const CAMERA_RESCAN_MS = 3000
let lastCameraScan = ''
let lastCameraScanAt = 0

function focusInput() {
  nextTick(() => inputEl.value?.focus())
}

async function lookUp(text: string) {
  const licenseId = licenseIdFromScan(text)
  if (!licenseId || busy.value || !idScanEnabled.value) return

  busy.value = true
  error.value = ''

  try {
    const res = await scanVendorIdCard(licenseId)
    stopCamera()
    await router.push(`/backoffice/userprofile/${res.data.ID}`)
  } catch (err) {
    error.value =
      axios.isAxiosError(err) && err.response?.status === 404
        ? t('idScanNotFound', { licenseId })
        : t('idScanFailed')

    input.value = ''
    focusInput()
  } finally {
    busy.value = false
  }
}

function submit() {
  lookUp(input.value)
}

async function startCamera() {
  if (!videoEl.value || cameraStarting.value) return

  cameraStarting.value = true
  error.value = ''

  try {
    const { default: QrScannerLib } = await import('qr-scanner')
    lastCameraScan = ''
    // qr-scanner makes a video that is hidden at construction permanently invisible
    cameraOn.value = true
    await nextTick()

    scanner = new QrScannerLib(
      videoEl.value,
      (result) => {
        const now = Date.now()
        if (busy.value) return
        if (result.data === lastCameraScan && now - lastCameraScanAt < CAMERA_RESCAN_MS) return
        lastCameraScan = result.data
        lastCameraScanAt = now
        lookUp(result.data)
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        returnDetailedScanResult: true
      }
    )

    await scanner.start()
  } catch {
    stopCamera()
    error.value = t('idScanCameraFailed')
  } finally {
    cameraStarting.value = false
  }
}

function stopCamera() {
  scanner?.destroy()
  scanner = null
  cameraOn.value = false
  focusInput()
}

onMounted(focusInput)

onBeforeUnmount(() => {
  scanner?.destroy()
  scanner = null
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('idScanTitle')" />
    </template>

    <template #main>
      <div v-if="!idScanEnabled" class="scan-disabled section">{{ $t('idScanDisabled') }}</div>
      <Card v-else class="section">
        <form class="scan-form" @submit.prevent="submit">
          <label for="id-scan-input" class="scan-label">{{ $t('idScanHint') }}</label>
          <div class="scan-row">
            <input
              id="id-scan-input"
              ref="inputEl"
              v-model="input"
              type="text"
              class="aug-input"
              autocomplete="off"
              :placeholder="$t('idScanPlaceholder')"
              :disabled="busy"
            />
            <Button type="submit" :disabled="busy || !input.trim()">{{ $t('idScanOpen') }}</Button>
          </div>
        </form>

        <div v-if="error" class="scan-error" role="alert">{{ error }}</div>

        <div class="camera">
          <Button
            v-if="!cameraOn"
            variant="secondary"
            :disabled="cameraStarting"
            @click="startCamera"
          >
            <font-awesome-icon :icon="faCamera" /> {{ $t('idScanCameraStart') }}
          </Button>
          <Button v-else variant="secondary" :disabled="cameraStarting" @click="stopCamera">
            <font-awesome-icon :icon="faVideoSlash" /> {{ $t('idScanCameraStop') }}
          </Button>
          <div v-show="cameraOn" class="camera-frame">
            <video ref="videoEl" class="camera-video" muted playsinline />
          </div>
        </div>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.section {
  max-width: 640px;
  margin: 0 auto;
}
.scan-disabled {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  color: var(--color-info);
  border: 1px solid var(--color-info);
}
.scan-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scan-label {
  font-size: 13.5px;
  color: var(--color-text-muted);
}
.scan-row {
  display: flex;
  gap: 8px;
}
.scan-row .aug-input {
  flex: 1;
  min-width: 0;
}
.scan-error {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 13.5px;
}
.camera {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.camera-frame {
  position: relative;
  width: 100%;
  max-width: 480px;
}
.camera-video {
  display: block;
  width: 100%;
  max-width: 480px;
  border-radius: var(--radius);
  background: #000;
}
</style>
