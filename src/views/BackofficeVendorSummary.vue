<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold underline mt-3 pt-3">Übersicht aller VerkäuferInnen</h1>

          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Ausweisnummer</th>
                <th className="p-3">Vorname</th>
                <th className="p-3">Name</th>
                <th className="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr v-for="vendor in vendors" :key="vendor.ID">
                <td className="border-t-2 p-3">
                  <router-link :to="`/backoffice/userprofile/${vendor.ID}`">{{
                    vendor?.LicenseID
                  }}</router-link>
                </td>
                <td className="border-t-2 p-3">{{ vendor.FirstName }}</td>
                <td className="border-t-2 p-3">{{ vendor.LastName }}</td>

                <div class="flex">
                  <button
                    @click="generateQRCode(vendor)"
                    className="p-2 rounded-full bg-lime-600 text-white mr-2"
                  >
                    QR-Code erstellen
                  </button>
                  <button
                    @click="createPDF(vendor)"
                    className="p-2 rounded-full bg-lime-600 text-white mr-2"
                  >
                    Din-A4 Download
                  </button>
                </div>
              </tr>
            </tbody>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>

<script lang="ts" setup>
// Import necessary dependencies and types
import { vendorsStore } from '../stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import QrcodeVue from 'qrcode.vue'

// Initialize the vendor store
const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  store.getVendors()
})

// Create a computed property for vendors data
const vendors = computed(() => store.vendors)

// Function to generate QR code and open it in a new window
const generateQRCode = async (vendor: Vendor) => {
  if (vendor.QRCode) {
    try {
      // Generate the QR code data URL using QrcodeVue
      const qrCodeDataUrl = await QrcodeVue.Vue.toDataURL(vendor.QRCode)

      // Open a new browser window to display the QR code
      const qrWindow = window.open('', '_blank')
      if (qrWindow) {
        qrWindow.document.write(`<img src="${qrCodeDataUrl}" alt="QR Code">`)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  } else {
    console.error('No QR code found')
  }
}

// Function to create a PDF with the QR code
const createPDF = async (vendor: Vendor) => {
  if (vendor.QRCode) {
    try {
      // Create a new PDF document
      const pdfDoc = new jsPDF()

      // Generate the QR code data URL using QrcodeVue
      const qrCodeDataUrl = await QrcodeVue.Vue.toDataURL(vendor.QRCode)

      // Add an image of the QR code to the PDF
      pdfDoc.addImage(qrCodeDataUrl, 'JPEG', 50, 150, 100, 100)

      // Save the PDF as a Blob and create a download link
      const pdfBytes = pdfDoc.output('blob')
      const url = URL.createObjectURL(pdfBytes)
      const a = document.createElement('a')
      a.href = url
      a.download = `vendor_${vendor.ID}_qr.pdf`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating PDF:', error)
    }
  } else {
    console.error('No QR code found')
  }
}
</script>
