<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">VerkäuferInnen</h1>
      <span>
        <input id="searchInput" type="text" placeholder="Suche Ausweisnummer"
          class="border-2 border-gray-400 rounded-md p-2 ml-2" v-model="searchQuery" @keyup.enter="search" />
        <button @click="search" class="p-3 rounded-full bg-lime-600 ml-2 text-white">Suchen</button>
      </span>
    </template>

    <template #main>
      <div class="main">
        <div class="mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3 page-content space-x-2 mt-5">
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Ausweisnummer</th>
                  <th className="p-3">Vorname</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Kredit</th>
                  <th className="p-3">Aktionen</th>
                </tr>
              </thead>
              <tbody className="text-sm p-3">
                <tr v-for="vendor in displayVendors" :key="vendor.ID" class="border-t-2">
                  <td className="p-3">
                    <router-link :to="`/backoffice/userprofile/${vendor.ID}`">{{
                      vendor?.LicenseID
                    }}</router-link>
                  </td>
                  <td className="p-3">{{ vendor.FirstName }}</td>
                  <td className="p-3">{{ vendor.LastName }}</td>
                  <td className="p-3">{{ formatCredit(vendor.Balance) }}€</td>

                  <td class="flex justify-center  ">
                    <span id="canvas"></span>
                    <button className="p-2 rounded-full h-10 w-10 bg-lime-600 text-white mr-2">
                      <router-link :to="`/backoffice/userprofile/${vendor.ID}`">
                        <font-awesome-icon :icon="faArrowAltCircleRight" />

                      </router-link>
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2 h-10 w-10">
                      <router-link :to="`/backoffice/credits/payout/${vendor.ID}`">
                        <font-awesome-icon :icon="faCreditCard" />
                      </router-link>
                    </button>
                    <button @click="generateQRCode(vendor)"
                      className="p-2 rounded-full h-10 w-10 bg-lime-600 text-white mr-2">
                      <font-awesome-icon :icon="faQrcode" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer>
        <router-link to="/backoffice/newvendor">
          <button className="p-3 rounded-full bg-lime-600 text-white fixed bottom-10 right-10 h-16 w-16">
            Neu
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<style scoped>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>

<script lang="ts" setup>
// Import necessary dependencies and types
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { ref, computed, onMounted, watch } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import keycloak from '@/keycloak/keycloak'
import { faCreditCard, faArrowAltCircleRight, faQrcode } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Initialize the vendor store
const store = vendorsStore()
keycloak.keycloak.onAuthSuccess = () => {
  store.getVendors()
}

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  if (keycloak.keycloak.authenticated) {
    store.getVendors()
  }
})
// Create a computed property for vendors data
const vendors = computed(() => store.vendors)

// create a search function for the search input
const searchQuery = ref('')
watch(searchQuery, () => {
  search()
})
const search = () => {
  if (searchQuery.value) {
    store.searchVendors(searchQuery.value)
  } else {
    store.getVendors()
  }
}
// Create a computed property to display vendors based on searchQuery
const displayVendors = computed(() => {
  return searchQuery.value ? store.filteredVendors : vendors.value
})

function formatCredit(credit: number) {
  return (credit / 100).toFixed(2)
}

// Function to generate QR code only if the button is clicked
const generateQRCode = async (vendor: Vendor) => {
  const qrCode = new QRCodeStyling({
    width: 500,
    height: 500,
    type: 'svg',
    data: `https://shop.augustin.or.at/v/${vendor.LicenseID}`,
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXwAAAGQCAYAAACtYdszAAAABHNCSVQICAgIfAhkiAAAIABJREFUeJzt3XmwJVV9B/Df6e573zpvBgYYlmFmBGUgYZnMOGLBmMQUKaRIhFBiVoMbm3FhIobIYiwDgmEpUINiZImWZYgIIRoroFjWGCNEGBAZ2YRhU5iB2d7Me3fr7pM/ZvrV5c29t3+/7nP69n3n+6maSvCd2326b99fnz59zu8orbUmAACY87x+VwAAAIqBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAI5AwAcAcAQCPgCAIxDwAQAcgYAPAOAIBHwAAEcg4AMAOAIBHwDAEQj4AACOQMAHAHAEAj4AgCMQ8AEAHIGADwDgCAR8AABHIOADADgCAR8AwBEI+AAAjkDABwBwBAI+AIAjEPABAByBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAI5AwAcAcAQCPgCAIxDwAQAcgYAPAOAIBHwAAEcg4AMAOAIBHwDAEQj4AACOQMAHAHAEAj4AgCMQ8AEAHIGADwDgCAR8AABHIOADADgCAR8AwBEI+AAAjkDABwBwBAI+AIAjEPABAByBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAI5AwAcAcAQCPgCAIxDwAQAcgYAPAOAIBHwAAEcg4AMAOAIBHwDAEQj4AACOQMAHAHAEAj4AgCMQ8AEAHIGADwDgCAR8AABHIOADADgCAR8AwBEI+AAAjkDABwBwBAI+AIAjEPABAByBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAI5AwAcAcAQCPgCAIxDwAQAcgYAPAOAIBHwAAEcg4AMAOAIBHwDAEQj4AACOQMAHAHAEAj4AgCMQ8AEAHIGADwDgCAR8AABHIOADADgCAR8AwBEI+AAAjkDABwBwBAI+AIAjEPABAByBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAI5AwAcAcAQCPgCAIxDwAQAcgYAPAOAIBHwAAEcg4AMAOAIBHwDAEQj4AACOQMAHAHAEAj4AgCMQ8AEAHIGADwDgCAR8AABHIOADADgCAR8AwBEI+AAAjkDABwBwBAI+AIAjEPABAByBgA8A4AgEfAAARyDgAwA4AgEfAMARCPgAAANOa02bNm2i888/n/793/+doigirTVprV9XTunZ/wsAAAyM973vfXTbbbd1/fu9995LJ510EimlEPABAAbVxo0b6bDDDkst53kehWGIgA8AMIiiKKKhoSGKoohVXimFPnwAgEEUxzE72CcQ8AEABlAQBOLPIOADAAwgpZT4Mwj4AAADKAxDUXn04QMAOML3fQR8AIBB5Pu+qHwURQj4AACDSDqiPo5jBHwAgEE0NTUlKl+pVBDwAQAGkbRL5/jjj0fABwAYRNddd52o/GmnnYaADwAwiKTj8M877zzk0gEAGET77bcfbdmyhV1+Try0TXI+P/roo/TBD36Qvv71r1Oz2aQ4jsVvsQEABsWOHTtE5bXWg9/CT7vLxXGcaQryIIiiiJRSFIYhbd26lS6//HK65pprqFqtkucN/L0cAHoYHx8XjdQZ+IDfarWoWq32LOP7vngKcplpraler9PExARprTtmywuCgFqtVh9qBwBF8TxP1Isx0AE/jmOqVCoUx3Fq2QE9xI6iKGJlyWu1Wpmy6QHAYJD2XGitB7sPnxPs5xru2NuxsTHLNQGAQTOwAX9kZIRddi618Lk3ubl0zABgxkAG/CiKqNlssstv3brVYm2KxX0Z22q1EPQLEoYhhWFIURThnEOpDWTAv/nmm0XlDz/8cEs1AZclgwaGhoaoUqlQEAQUBEFpgn5Z6gHlMXABP45jOu+880SfmZ6etlSb/uD24+MHb4fWmubNm0fVapVardbrutniOKaRkZG+jAxLRm2ddtpp5Ps++b5PSinyfZ/Gxsbm1Gg1yGbghnEopcSBbK5d6Ny383N1/kG/HXzwwbRr166uf280GgXWZrdf/epXdMQRR3T8bcRxTNPT0zNPIdu2baPx8fHC6wj9N3DDMrMGsQE7zJ6GhoZY7zDCMBRn1DMhDMPXDQnVWs+pmw/3WIq45rTWFASBeMTa+Pg4bdu2DUN3B9icH5aZzCwFnqLPldaaGo0GjYyMUBAEpJSa6VLwPI/OOussp4bS1ut1q9t/8MEHMwV7IqJdu3bRqaeeaqFWUGYD1cKXzixrN0CHmer555+nZcuWpZYravKV1pq++tWv0rnnnss6z57n0caNG2nJkiXW62YD90ZaqVREo8m44jimFStW0C9/+cuOM60l5tLvwjVZWvgDFfDztFgH6DBTTU5O0vz581PLFdGlE4YhVavVTOfX931qNpsDl/eH26VGZD6Xk9aalixZQi+99JKR7c211CMukVxXSqnBypa5zz779LsKM7TW9J3vfIdGR0dJKUWe59E//MM/FJahk/sIbzuQNhoNmjdvXuZjjqKIKpWK4VrZ99hjj7HLmu7C+sQnPmEs2IM7kpvDQLTw4zjO3VJtNptGgktaLhvf9+m5556jxYsX595XN9zzYStTaBRF9Mwzz9CRRx5p5AY3AJfg62itRTdTU8eXvB8xfb6Qd2kwSX7b8+fPp+3btw9GC//nP/957m28613vMlATogMOOKDn36MookMPPTRzNwdHvwOk53m0fPnyvtejX/qRcjuKIhofH2ef8+SFOaeet99+e97qQckde+yxRDQgE69WrlyZexv/+Z//aaAm/DQNrVbL+iiNfpiamjL6XmAQR10lo4648r641VrT8PAwu69dKUXT09MUxzG1Wq3Uc4xU2nPfW97yFiIagIBvqhVZdGDxPC81V/+g0VrT/Pnzjbbs844y6RdJwM977W3evJl9njzPo2azScPDw0S0++aU9h7hL//yL3PVzwatNYVhSHfeeSetXbuWVq1aRatWraLbbruN6vW6s0+XWZ100km7/x9dcp7naSLK/a9areauS6PRYO/P8zwDR99ZGIasOsRxbHS/CxYsMPJdJP+CIDBSrzAM9Te+8Q1NRPqggw7SL7/8so6iyMi2u1FKsY/zz//8zzPvJ4oi7fs+e1/djntkZKRjeaVU5rplFcfxTD1rtZq++OKLZ86n53ms33xyTkxf44NE8lur1Wq7P9PnOvcUx7Gx4GIiAN9xxx3s/a1cudLAGeisHwG/0WgYu/km/0zpFnw9z9Nf/OIXje2Hs89uwSmrW265xcgNtFarGa9bmiiKdBiGutFo6I997GPGr5+k/llu7lEU6UajYeQ30mw2db1e19///vf1Pffco1utVu5tckjOUxiGWmutSz1KR7pmYy9DQ0O5+9SDIGA/WtscA89d9SqKIiNDM+M4pmq1arT7ZXh4mGq1Wu7taMaIGaUU1et1o11skmshGQOdRaVSYffdp41ES4bBJj95pRTVajUaGhoS10vvSZfRvq0Pf/jDdOONNxba3SL5brXWNDExQfV6fea7832f1qxZQz/84Q8zd73NvhaUUlStVqlWq1ntSpZsO4kFpe7DNxXsiXYPactzIUZRJPrR2pzwtHPnTmvb7iTJ9W6KUsrYMXDOs9aahoaG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',

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
    qrCode.download({ name: vendor.LicenseID, extension: 'png' })
    canvas.innerHTML = ''
  }
}
</script>
