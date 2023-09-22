import type { Settings } from '@/models/settings'
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'
import type { Name } from '@/models/vendorName'
import { type AxiosResponse } from 'axios'
import { VIVAWALLET_TRANSACTION_ORDER, SETTINGS_API_URL, VIVAWALLET_TRANSACTION_VERIFICATION, VENDOR_CHECK_ID } from '@/api/endpoints'
import { apiInstance } from './api'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => apiInstance.get(SETTINGS_API_URL).then(responseBody)
}

const VivaWallet = {
    postOrder: (item: number, quantity: number, vendor: number): 
        Promise<VivaWalletResponse> => apiInstance
            .post(VIVAWALLET_TRANSACTION_ORDER, 
                { entries: [{item: item, quantity: quantity}], user: "user", vendor: vendor }, 
                { headers: { 'Content-Type': 'application/json' } })
                .then(sleep(100)).then(responseBody),
    verifyPayment: (vivaTransactionID: string):
        Promise<VivaWalletVerification> => apiInstance
            .post(VIVAWALLET_TRANSACTION_VERIFICATION,
                { transactionID: vivaTransactionID },
                { headers: { 'Content-Type': 'application/json' } })
            .then(sleep(100)).then(responseBody)
}

const Vendor = {
    checkID: (): Promise<Name> => apiInstance.get(VENDOR_CHECK_ID + 'fl-123/').then(responseBody)
}

export default {
    SettingsConfiguration,
    VivaWallet,
    Vendor,
}
