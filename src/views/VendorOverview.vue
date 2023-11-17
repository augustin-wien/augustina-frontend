<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="vendor-overview container ontent-center mx-auto mb-8 p-24 space-y-40 pb-3">
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-3xl font-bold">QR-Code</h2>
          <div id="canvas"></div>
          <div><strong>Url:</strong> {{ vendorMe?.URLID }}</div>
          <div>
            <strong>{{ $t('IDNumber') }}</strong
            >: {{ vendorMe?.LicenseID }}
          </div>
          <!-- <select
            class="h-[40px] w-[70px] bg-black border-2 border-white font-semibold rounded-full text-white text-center mt-4 mr-4 pl-2 text-sm"
            v-model="$i18n.locale"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
          -->
        </div>
        <br />
        <div class="my-16 container mt-8 pt-8 space-y-4">
          <h2 class="text-3xl font-bold">{{ $t('yourData') }}</h2>
          <div><strong>Name:</strong> {{ vendorMe?.FirstName }} {{ vendorMe?.LastName }}</div>
          <div><strong>Email: </strong>{{ vendorMe?.Email }}</div>
          <div>
            <strong> {{ $t('telephone') }}: </strong>{{ vendorMe?.Telephone }}
          </div>
          <div>
            <strong>{{ $t('location') }}: </strong>{{ vendorMe?.Location }}
          </div>
          <div>
            <strong>{{ $t('postCode') }}:</strong> {{ vendorMe?.PLZ }}
          </div>
          <div>
            <strong>{{ $t('menuCredits') }}: </strong>{{ vendorMe?.Balance }}€
          </div>
          <div>
            <strong>{{ $t('lastPayout') }}: </strong>{{ vendorMe?.LastPayout }}
          </div>
          <div>
            <strong>{{ $t('lastTransactions') }}: </strong>tbd
          </div>

          <button
            class="bg-black rounded-full p-5 text-white text-3xl w-full font-semibold"
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
    vendorMe.value = await store.getVendorMe()
    generateQRCode(vendorMe.value)
  } catch (error) {
    console.error('Fehler beim API-Aufruf:', error)
  }
})

//qrcode
const generateQRCode = async (vendor: Vendor) => {
  const qrCode = new QRCodeStyling({
    width: 100,
    height: 100,
    type: 'svg',
    data: `https://shop.augustin.or.at/v/${vendorMe.LicenseID}`,

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
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20rem;
  padding-bottom: 16rem;
}

.my-16 {
  margin-top: 30rem;
  margin-bottom: 4rem;
  padding-top: 30rem;
}

h2 {
  font-size: large;
}
</style>
