<script setup lang="ts">
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconCross from '@/components/icons/IconCross.vue'
import { useItemsStore } from '@/stores/items'
import { usePaymentStore } from '@/stores/payment'
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted, ref } from 'vue'

const paymentStore = usePaymentStore()
const settStore = useSettingsStore()
const itemsStore = useItemsStore()
const PDFDownloadStore = usePDFDownloadStore()

const isConfirmed = ref(paymentStore.timeStamp == '')

function currentDate() {
  const current = new Date()
  const date = `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`
  return date
}

const price = computed(() =>
  paymentStore.verification?.TotalSum ? paymentStore.verification?.TotalSum / 100 : 0
)

const downloadLinks = computed(() => paymentStore.verification?.PDFDownloadLinks)

const purchasedItems = computed(() => paymentStore.verification?.PurchasedItems)

// Define the computed property that checks the condition
const hasSingleDigitalItem = computed(() => {
  // Get the list of purchased items
  const items = purchasedItems.value

  // Check if the list length is exactly one
  if (items?.length === 1) {
    // Get the first item in the list
    const item = items[0]

    // Get the attribute licenseItem of the item
    const itemLicenseItem = itemLicenseItemAttribute(item.Item)

    // Check if the item name has license item
    return itemLicenseItem !== null && itemLicenseItem !== undefined
  }

  if (items?.length === 2) {
    // Iterate over the list of purchased items
    for (const item of items) {
      // Get the attribute licenseItem of the item
      const itemLicenseItem = itemLicenseItemAttribute(item.Item)

      // Return false if null
      if (itemLicenseItem !== null && itemLicenseItem !== undefined) {
        return true
      }
    }

    return false
  }

  // Return false if the list length is not one or two
  return false
})

const time = ref('not')

function currentTime() {
  const now = new Date()
  time.value = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

const formatTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

function UpdateTime() {
  setTimeout(() => {
    currentTime()
    UpdateTime()
  }, 1000)
}

onMounted(() => {
  itemsStore.getItems()
})

const itemName = (id: number) => {
  const item = itemsStore.items?.find((item) => item.ID == id)

  return item?.Name
}

const itemLicenseItemAttribute = (id: number) => {
  const item = itemsStore.items?.find((item) => item.ID == id)
  return item?.LicenseItem
}

const downloadPDF = (link: string) => {
  PDFDownloadStore.downloadPDF(link)
  // TODO: Implement validation without triggering spam protection in the browser
  // PDFDownloadStore.validatePDFDownload(link)
  //   .then((res) => {
  //     if (res) {
  //       PDFDownloadStore.downloadPDF(link)
  //     }
  //   })
  //   .catch((error) => {
  //     console.log('PDF is invalid')
  //     alert('PDF is invalid')
  //     console.log(error)
  //   })
}

UpdateTime()
const apiUrl = import.meta.env.VITE_API_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div
        id="payment-confirmation-page"
        className="grid grid-rows-6 h-full place-items-center w-full"
      >
        <div
          v-if="!hasSingleDigitalItem"
          className="h-full w-full text-center grid grid-rows-2 font-semibold text-xl"
        >
          <div v-if="!isConfirmed">
            <div>{{ $t('symbol') }}</div>
            <div>{{ paymentStore.firstName }}</div>
          </div>
          <div v-else>
            <div>{{ $t('invalid confirmation') }}</div>
          </div>
        </div>
        <div v-else className="h-full w-full text-center grid grid-rows-2 font-semibold text-xl">
          <div>{{ $t('have fun') }}</div>
        </div>
        <div v-if="!isConfirmed" class="row-span-4 font-bold w-fit h-full relative">
          <div v-if="!hasSingleDigitalItem" class="flex justify-center mb-4">
            <div
              v-if="!isConfirmed"
              class="rounded-full text-6xl absolute h-12 w-12 fill-white right-0 top-0 place-items-center grid"
              :class="{ 'bg-red-600': isConfirmed, 'bg-green-600': !isConfirmed }"
            >
              <IconCheckmark v-if="!isConfirmed" />
            </div>
            <img
              v-if="!isConfirmed"
              class="rounded-full h-44 w-44 object-cover customborder border-4"
              alt="Titelblatt"
              :src="
                settStore.settings.MainItemImage
                  ? apiUrl + settStore.settings.MainItemImage
                  : '/Titelseite.jpg'
              "
            />
          </div>
          <div class="grid grid-cols-2">
            <div
              v-for="item in purchasedItems"
              :key="item.ID"
              :class="purchasedItems.length == 1 ? 'col-span-2' : 'col-span-1'"
            >
              <div
                class="col-span-1 text-s w-full text-center font-semibold text-white bg-black p-3 rounded-full mb-3"
              >
                {{ item.Item == 2 ? item.Quantity / 100 + ' €' : item.Quantity + 'x' }}
                {{ item.Item == 2 ? $t('donation') : itemName(item.Item) }}
              </div>
            </div>
          </div>
          <div class="w-full row-span-2">
            <p class="text-center text-3xl font-semibold">{{ price.toFixed(2) }}€</p>
          </div>
          <div class="w-full row-span-1 mt-1">
            <button
              v-for="downloadLink in downloadLinks"
              :key="downloadLink.ItemID"
              class="bg-gray-500 rounded-full text-center p-5 customfont text-sm font font-semibold w-full"
              :style="'background-color:' + settStore.settings.Color"
              @click="downloadPDF(downloadLink.Link)"
            >
              {{ $t('Download') + ' ' + itemName(downloadLink.ItemID) }}
            </button>
          </div>
        </div>
        <div v-else class="text-6xl row-span-4 font-bold w-fit h-full relative">
          <div
            class="bg-red-600 rounded-full h-44 w-44 fill-white right-0 top-0 place-items-center grid"
          >
            <IconCross />
          </div>
        </div>
        <div
          v-if="!hasSingleDigitalItem != !isConfirmed"
          class="grid grid-rows-2 place-items-center"
        >
          <div>
            <span class="date text-l">{{ currentDate() }} </span
            ><span class="time text-l"> {{ $t('at') }} {{ time }}</span>
          </div>
          <span class="date text-l"
            >{{ $t('bought') }} {{ formatTime(paymentStore.timeStamp) }}</span
          >
        </div>
      </div>
    </template>
  </component>
</template>
