<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import QRCodeStyling from 'qr-code-styling'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'

const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const store = vendorsStore()
const settStore = useSettingsStore()

const vendorMe = computed(() => store.vendor)

onMounted(async () => {
  if (authenticated.value) {
    generateQRCode(vendorMe.value)

    try {
      store.fetchVendorMe()
    } catch (error) {
      console.error('Fehler beim API-Aufruf:', error)
    }
  } else {
    watch(authenticated, async () => {
      store.fetchVendorMe()
      generateQRCode(vendorMe.value)

      if (authenticated.value) {
        try {
          store.fetchVendorMe()
        } catch (error) {
          console.error('Fehler beim API-Aufruf:', error)
        }
      }
    })
  }
})

//qrcode
const generateQRCode = async (vendorMe: Vendor) => {
  const qrCode = new QRCodeStyling({
    width: 200,
    height: 200,
    type: 'svg',
    data: `https://shop.augustin.or.at/v/${vendorMe?.LicenseID}`,

    dotsOptions: {
      color: '#000',
      type: 'dots'
    },
    backgroundOptions: {
      color: '#fff'
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 20
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
      errorCorrectionLevel: 'Q'
    }
  })

  const canvas = document.getElementById('canvas')

  if (canvas !== null) {
    qrCode.append(canvas)
  }
}

// Computed property to manage dynamic styles
const customColor = computed(() => {
  return {
    '--custom-bg-color': settStore.settings.Color
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <!--Main template-->
      <div className="vendor-overview container mb-8 space-y-40 pb-3 w-5/6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">QR-Code</h1>
          <div class="content-center">
            <div id="canvas"></div>
            <div>
              <strong class="mr-2">{{ $t('Url') }}:</strong>
              <a href="{{ `https://shop.augustin.or.at/v/${vendorMe?.LicenseID}` }}">
                {{ `https://shop.augustin.or.at/v/${vendorMe?.LicenseID}` }}
              </a>
            </div>
          </div>
          <button
            :style="customColor"
            class="p-2 rounded-full customcolor text-white"
            @click="router.push('/me')"
          >
            {{ $t('back') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<style>
.vendor-overview {
  display: flex;
  flex-direction: column;
}
.container {
  max-width: 300px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
#canvas {
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.customcolor {
  background-color: var(--custom-bg-color);
}
</style>
