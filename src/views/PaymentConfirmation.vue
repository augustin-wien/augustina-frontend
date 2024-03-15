<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { usePaymentStore } from '@/stores/payment'
import { useItemsStore } from '@/stores/items'
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconCross from '@/components/icons/IconCross.vue'

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
      <div className="grid grid-rows-6 h-full place-items-center w-full">
        <div className="h-full w-full text-center grid grid-rows-2 font-semibold text-xl">
          <div>{{ $t('symbol') }}</div>
          <div>{{ paymentStore.firstName }}</div>
        </div>
        <div v-if="!isConfirmed" class="row-span-4 font-bold w-fit h-full relative">
          <div class="flex justify-center mb-4">
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
            <div v-for="item in purchasedItems" :key="item.ID" class="col-span-1">
              <div
                class="col-span-1 text-s w-full h-[45px] text-center font-semibold text-white bg-black p-3 rounded-full mb-3"
              >
                {{ item.Item == 2 ? item.Quantity / 100 + ' €' : item.Quantity + 'x' }}
                {{ item.Item == 2 ? $t('donation') : itemName(item.Item) }}
              </div>
            </div>
          </div>
          <div class="w-full row-span-2">
            <p class="text-center text-3xl font-semibold">{{ price }}€</p>
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

        <div class="grid grid-rows-2 place-items-center">
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
