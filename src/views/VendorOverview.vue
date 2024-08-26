<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import keycloak from '@/keycloak/keycloak'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import QRCodeStyling from 'qr-code-styling'
import { useKeycloakStore } from '@/stores/keycloak'
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settStore = useSettingsStore()
const store = vendorsStore()
const keycloakStore = useKeycloakStore()

const vendorMe = computed(() => store.vendor)
const authenticated = computed(() => keycloakStore.authenticated)

const failure = ref(false)
const failureMessage = ref('')

const formatTime = (date: string) => {
  const d = new Date(date)

  const formattedDate = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear() - 2000}`

  const formattedTime = `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  return `${formattedDate} - ${formattedTime}`
}

watch(vendorMe as any, () => {
  generateQRCode(vendorMe.value)
})

onMounted(async () => {
  if (authenticated.value) {
    try {
      store.fetchVendorMe()

      if (vendorMe.value) {
        generateQRCode(vendorMe.value)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim API-Aufruf:', error)
    }
  } else {
    watch(authenticated, async () => {
      if (authenticated.value) {
        try {
          await store.fetchVendorMe()

          if (vendorMe.value) {
            generateQRCode(vendorMe.value)
          }
        } catch (error) {
          failure.value = true

          if (error instanceof Error) {
            // eslint-disable-next-line no-console
            console.error('Fehler beim API-Aufruf:', error)
          } else {
            // eslint-disable-next-line no-console
            console.error('Fehler beim API-Aufruf:', error as Error)
          }
        }
      }
    })
  }
})

//qrcode
const generateQRCode = async (vendorMe: Vendor) => {
  const qrCode = new QRCodeStyling({
    width: 100,
    height: 100,
    type: 'svg',
    data: `${import.meta.env.VITE_FRONTEND_URL}/v/${vendorMe?.LicenseID}`,

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
      <div v-if="authenticated" className="vendor-overview container mb-8 space-y-2">
        <div v-if="!failure" className="flex flex-col items-center space-y-4">
          <h1 className="text-3xl font-bold">{{ $t('yourData') }}</h1>
          <div class="grid grid-cols-2 place-content-between text-2xl">
            <strong>{{ $t('menuCredits') }}: </strong>
            <span v-if="vendorMe?.Balance !== undefined" class="font-bold"
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
                <div v-if="OpenPayment.Item !== 3">
                  <div class="flex-none grid grid-rows-1 place-content-start">
                    <div class="pb-1">
                      {{ formatTime(OpenPayment.Timestamp) }},<b class="ml-3">
                        {{ (OpenPayment.Amount / 100).toFixed(2) }}€
                      </b>
                    </div>
                  </div>
                  <hr class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-200" />
                </div>
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
              @click="keycloak.keycloak?.logout()"
            >
              <font-awesome-icon :icon="faArrowRightFromBracket" />
              <p class="text-base leading-4">{{ $t('Logout') }}</p>
            </button>
          </div>
        </div>
        <div v-else>
          <div class="mt-10 font-bold text-lg mb-5 text-red-800">
            {{ $t('Something went wrong please try it again or contact the office.') }}
          </div>
          {{ $t('error') + ': ' + failureMessage }}
        </div>
      </div>
    </template>
  </component>
</template>

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
