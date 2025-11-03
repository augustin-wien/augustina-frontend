<script setup lang="ts">
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconDigitalIssue from '@/components/icons/IconDigitalIssue.vue'
import IconCross from '@/components/icons/IconCross.vue'
import { useItemsStore } from '@/stores/items'
import { usePaymentStore } from '@/stores/payment'
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted, ref } from 'vue'

const DONATION_ITEM_ID = 2

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

const purchasedItems = computed(() => {
  const items = paymentStore.verification?.PurchasedItems
  if (!items) return []

  // Use a shallow copy to avoid mutating the original array and convert booleans to numbers for arithmetic
  const tmp_items = [...items].sort(
    (a, b) => Number(isLicenseItem(a.Item)) - Number(isLicenseItem(b.Item))
  )

  // duplicate items with quantity > 1
  const result: typeof tmp_items = []

  tmp_items.forEach((item) => {
    if (item.Item == DONATION_ITEM_ID) {
      // donation item, only one entry
      result.push({ ...item })
      return
    }

    for (let i = 0; i < item.Quantity; i++) {
      result.push({ ...item, Quantity: 1 })
    }
  })

  return result
})

const digitalItems = computed(() => {
  const items = purchasedItems.value
  if (!items) return []

  return items.filter((item) => {
    const itemDetails = itemsStore.items?.find((i) => i.ID == item.Item)
    return itemDetails && itemDetails.LicenseItem
  })
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

const isLicenseItem = (id: number) => {
  const item = itemsStore.items?.find((item) => item.ID == id)
  return item?.LicenseItem != null && item?.LicenseItem != undefined
}

const itemDetails = (id: number) => {
  const item = itemsStore.items?.find((item) => item.ID == id)
  return item
}

const hasDigitalItemWithoutPDF = computed(() => {
  const items = purchasedItems.value

  if (!items) return false

  for (const item of items) {
    const itemDetails = itemsStore.items?.find((i) => i.ID == item.Item)

    if (
      itemDetails &&
      itemDetails.LicenseItem &&
      !downloadLinks.value?.some((link) => link.ItemID == item.Item)
    ) {
      return true
    }
  }

  return false
})

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
        <div class="confirmation-wrapper h-full w-full text-center grid grid-rows-3">
          <div class="confirmation-validation text-sm">
            <div>
              <span class="date">{{ currentDate() }} {{ time }}</span>
            </div>
          </div>
          <div v-if="!isConfirmed" class="confirmation-header font-semibold text-x">
            <h1 class="confirmation-title font-bold font-semibold text-xl">
              {{ $t('payment confirmation') }}
            </h1>
            <div class="confirmation-hint text-sm mt-2">
              <div class="confirmation-label">{{ $t('symbol') }}</div>
              <div class="vendor-name">{{ paymentStore.firstName }}</div>
            </div>
          </div>
          <div v-else class="invalid-confirmation-wrapper">
            <div>{{ $t('invalid confirmation') }}</div>
          </div>
        </div>
        <div v-if="!isConfirmed" class="row-span-4 font-bold w-fit h-full relative">
          <div class="purchased-items-wrapper grid grid-cols-2">
            <div
              v-for="item in purchasedItems"
              :key="item.ID"
              :class="
                purchasedItems?.length == 1 ||
                item.Item == DONATION_ITEM_ID ||
                item.Quantity % 2 == 0
                  ? 'item col-span-2 grid grid-cols-2'
                  : 'item col-span-1'
              "
            >
              <div
                v-for="(_, element) in Array(item.Quantity)"
                :key="element"
                :class="`item-content relative p-2  ${item.Item == DONATION_ITEM_ID && element > 0 ? 'hidden' : ''} ${item.Item == DONATION_ITEM_ID ? ' col-span-2' : ''}`"
              >
                <img
                  v-if="itemDetails(item.Item)?.Image"
                  class="item-image"
                  :src="apiUrl + itemDetails(item.Item)?.Image"
                />
                <div
                  v-if="item.Item == DONATION_ITEM_ID"
                  class="item-donation-label-wrapper col-span-2 text-s w-full text-center font-semibold text-white bg-gray-500 p-3 rounded-full mb-3"
                >
                  <div class="item-donation-label col-span-2">
                    {{ item.Quantity / 100 + ' €' }}
                    {{
                      settStore.settings.UseTipInsteadOfDonation
                        ? $t('customtip')
                        : $t('customdonation')
                    }}
                  </div>
                </div>
                <div class="item-confirmation-icon">
                  <div
                    v-if="isLicenseItem(item.Item)"
                    class="check-mark-success bg-white border-2 rounded-full h-15 w-15 fill-white right-0 top-0 place-items-center grid"
                  >
                    <IconDigitalIssue />
                  </div>
                  <div
                    v-else-if="!isLicenseItem(item.Item) && item.Item !== DONATION_ITEM_ID"
                    class="check-mark-success bg-green-600 rounded-full h-15 w-15 fill-white right-0 top-0 place-items-center grid"
                  >
                    <IconCheckmark />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="price-wrapper w-full row-span-2">
            <p class="price text-center text-3xl font-semibold">{{ price.toFixed(2) }}€</p>
          </div>
          <div class="timestamp-wrapper text-center w-full row-span-1">
            {{ $t('bought') }} {{ formatTime(paymentStore.timeStamp) }}
          </div>
          <div class="w-full row-span-1 mt-1">
            <button
              v-for="downloadLink in downloadLinks"
              :key="downloadLink.ItemID"
              class="digital-item-download-button bg-gray-500 rounded-full text-center p-5 customfont text-sm font font-semibold w-full"
              :style="'background-color:' + settStore.settings.Color"
              @click="downloadPDF(downloadLink.Link)"
            >
              {{ $t('Download') + ' ' + itemName(downloadLink.ItemID) }}
            </button>
          </div>
          <div v-if="hasDigitalItemWithoutPDF" class="digitial-item-link mt-3">
            <a :href="settStore.settings.DigitalItemsUrl" target="_blank" rel="noopener noreferrer">
              <button
                class="digital-item-download-button bg-gray-500 rounded-full text-center p-5 customfont text-sm font font-semibold w-full cursor-pointer"
                :style="
                  'background-color:' +
                  settStore.settings.Color +
                  '; color: ' +
                  settStore.settings.FontColor
                "
              >
                {{
                  $t('accessDigitalItem', {
                    itemName: digitalItems[0]?.Item ? itemDetails(digitalItems[0].Item)?.Name : ''
                  })
                }}
              </button>
            </a>
          </div>
        </div>
        <div v-else class="text-6xl row-span-4 font-bold w-fit h-full relative">
          <div
            class="check-mark-failed bg-red-600 rounded-full h-44 w-44 fill-white right-0 top-0 place-items-center grid"
          >
            <IconCross />
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.item-image {
  margin-bottom: 10px;
  /* all images should have the same size */
  object-fit: cover;
  height: 150px;
  width: 120px;
}
.item {
  position: relative;
}
.item-confirmation-icon {
  position: absolute;
  top: 30px;
  right: 10px;
}
</style>
