<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <!--Main template-->
      <div className="vendor-overview container mb-8 space-y-2">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-3xl font-bold">{{ $t('yourData') }}</h1>
          <div class="grid grid-cols-2 place-content-between text-2xl">
            <strong>{{ $t('menuCredits') }}: </strong>
            <span class="font-bold"
              >{{
                vendorMe?.Balance !== undefined ? (vendorMe?.Balance / 100).toFixed(2) : 'N/A'
              }}
              €</span
            >
          </div>
          <div class="grid grid-cols-2 place-content-between">
            <strong>{{ $t('lastPayout') }}: </strong>{{ vendorMe?.LastPayout }}
          </div>
          <div class="grid grid-cols-2 place-content-between">
            <strong>{{ $t('lastTransactions') }}: </strong>
          </div>

          <!--Liste zum scrollen Anfang-->
          <div class="h-5/6 pb-3">
            <ul
              class="list-image-none overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl"
            >
              <li
                v-for="(OpenPayment, index) in vendorMe?.OpenPayments"
                :key="index"
                class="flex w-full p-1 pt-2 relative"
              >
                <div class="flex-none grid grid-rows-1 place-content-start">
                  <div class="pb-1">
                    {{ formatTime(OpenPayment.Timestamp) }}, {{ $t('amount') }}:
                    {{ (OpenPayment.Amount / 100).toFixed(2) }}€
                  </div>
                </div>
                <hr class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-200" />
              </li>
            </ul>
          </div>
          <!--Liste zum scrollen Ende-->

          <div :style="customColor" class="flex space-x-4">
            <router-link to="/me/qrcode">
              <button class="p-2 rounded-full customcolor text-white">QR-Code</button>
            </router-link>
            <router-link to="/me/profile">
              <button class="p-2 rounded-full customcolor text-white">Profil</button>
            </router-link>
            <button
              class="p-2 rounded-full customcolor text-white"
              @click="keycloak.keycloak.logout"
            >
              <font-awesome-icon :icon="faArrowRightFromBracket" />
              <p class="text-base leading-4">{{ $t('Logout') }}</p>
            </button>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import keycloak from '@/keycloak/keycloak'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import QRCodeStyling from 'qr-code-styling'
import { useKeycloakStore } from '@/stores/keycloak'
import { computed } from 'vue'
import { settingsStore } from '@/stores/settings'

const settStore = settingsStore()
const store = vendorsStore()
const keycloakStore = useKeycloakStore()

const vendorMe = ref<Vendor | null>(null)

const authenticated = computed(() => keycloakStore.authenticated)

const formatTime = (date: string) => {
  const d = new Date(date)
  const formattedDate = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`
  const formattedTime = `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  return `${formattedDate} - ${formattedTime}`
}

onMounted(async () => {
  if (authenticated.value) {
    try {
      vendorMe.value = await store.fetchVendorMe()
      if (vendorMe.value) {
        generateQRCode(vendorMe.value)
      }
    } catch (error) {
      console.error('Fehler beim API-Aufruf:', error)
    }
  }
  try {
    vendorMe.value = await store.fetchVendorMe()
    if (vendorMe.value) {
      generateQRCode(vendorMe.value)
    }
  } catch (error) {
    console.error('Fehler beim API-Aufruf:', error)
  }
})

//qrcode
const generateQRCode = async (vendorMe: Vendor) => {
  const qrCode = new QRCodeStyling({
    width: 100,
    height: 100,
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

<style scoped>
.customcolor {
  background-color: var(--custom-bg-color);
}

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
