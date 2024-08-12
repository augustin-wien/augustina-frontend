export interface PurchesedItem {
  ID: number
  IsSale: boolean
  Item: number
  Price: number
  Quantity: number
}
export interface PDFDownloadLinks {
  ItemID: number
  Link: string
}

export interface VivaWalletVerification {
  FirstName: string
  TimeStamp: string
  TotalSum: number
  PurchasedItems: PurchesedItem[]
  PDFDownloadLinks: PDFDownloadLinks[]
}
