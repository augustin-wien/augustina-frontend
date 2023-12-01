<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <!--Main template-->
      <div className="vendor-overview container mb-8 space-y-40 pb-3 w-5/6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">Meine Info</h1>
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
            {{ vendorMe?.OpenPayments[1].SenderName }}

            <!--Liste zum scrollen Anfang-->
            <div class="h-5/6 pb-3">
              <ul
                class="list-image-none overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl"
              >
                <li v-if="vendorMe?.LastPayout" class="flex w-full p-1 pt-2 relative">
                  <div class="flex-none grid grid-rows-1 place-content-start mr-2">
                    <div class="pb-1"></div>
                  </div>
                  <hr class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-200" />
                </li>
              </ul>
            </div>
            <!--Liste zum scrollen Ende-->
          </div>

          <!-- Buttons -->

          <router-link to="/me/qrcode">
            <button class="p-2 rounded-full bg-lime-600 text-white mr-2">QR-Code</button>
          </router-link>
          <router-link to="/me/profile">
            <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Profil</button>
          </router-link>

          <!-- First Content 
          <div v-if="showFirstContent">
            <h2 className="text-2xl font-bold">QR-Code</h2>
            <div id="canvas"></div>
            <div><strong>Url:</strong> {{ vendorMe?.UrlID }}</div>
          </div>


          <div v-if="showSecondContent">
            <div class="information my-16 mt-8 pt-8 space-y-4 text-sm">
              <h2 class="text-2xl font-bold text-center">{{ $t('yourData') }}</h2>
              <div class="grid grid-cols-2 place-content-between">
                <strong>Name:</strong>
                {{ vendorMe?.FirstName }} {{ vendorMe?.LastName }}
              </div>
              <div>
                <strong>{{ $t('IDNumber') }}</strong
                >: {{ vendorMe?.LicenseID }}
              </div>
              <div class="grid grid-cols-2 place-content-between">
                <strong>Email: </strong>{{ vendorMe?.Email }}
              </div>
              <div class="grid grid-cols-2 place-content-between">
                <strong> {{ $t('telephone') }}: </strong>{{ vendorMe?.Telephone }}
              </div>
              <div class="grid grid-cols-2 place-content-between">
                <strong>{{ $t('location') }}: </strong>{{ vendorMe?.Location }}
              </div>
              <div class="grid grid-cols-2 place-content-between">
                <strong>{{ $t('postCode') }}:</strong> {{ vendorMe?.PLZ }}
              </div>
            </div>
          </div>
-->
          <!-- Logout Button -->
          <button
            class="p-2 rounded-full bg-lime-600 text-white mr-2"
            @click="keycloak.keycloak.logout"
          >
            <font-awesome-icon :icon="faArrowRightFromBracket" />
            <p class="text-base leading-4">{{ $t('Logout') }}</p>
          </button>
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

const store = vendorsStore()

const vendorMe = ref<Vendor | null>(null)

onMounted(async () => {
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
</script>

<style>
.vendor-overview {
  display: flex;
  flex-direction: column;
}

.my-16 {
  margin-bottom: 4rem;
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
