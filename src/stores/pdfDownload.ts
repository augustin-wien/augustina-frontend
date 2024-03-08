import { defineStore } from 'pinia'
import { validatePdfDownload, pdfDownload } from '@/api/api'

export interface PDFDownload {
  From: string | null
  To: string | null
  VendorLicenseID: string
}

export const usePDFDownloadStore = defineStore('pdfdownload', {
  state: () => {
    return {
      pdfDownload: {} as PDFDownload
    }
  },
  actions: {
    validatePDFDownload(linkId: string) {
      return new Promise((resolve, reject) => {
        validatePdfDownload(linkId)
          .then((response) => {
            this.pdfDownload = response.data
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    downloadPDF(linkId: string) {
      return new Promise((resolve, reject) => {
        pdfDownload(linkId)
          .then((response) => {
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
})
