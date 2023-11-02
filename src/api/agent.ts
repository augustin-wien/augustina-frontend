import type { Settings } from '@/models/settings'
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'
import type { Name } from '@/models/vendorName'
import { type AxiosResponse } from 'axios'
import { VIVAWALLET_TRANSACTION_ORDER, SETTINGS_API_URL, VIVAWALLET_TRANSACTION_VERIFICATION, VENDOR_CHECK_ID } from '@/api/endpoints'
import { apiInstance } from './api'
import type { orderItem } from '@/stores/payment'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => apiInstance.get(SETTINGS_API_URL).then(responseBody)
}

const VivaWallet = {
    postOrder: (items:Array<orderItem>, vendorLicenseID: string): 
        Promise<VivaWalletResponse> => apiInstance
            .post(VIVAWALLET_TRANSACTION_ORDER, 
                { entries: items, user: "user", vendorLicenseID: vendorLicenseID }, 
                { headers: { 'Content-Type': 'application/json' } })
                .then(sleep(100)).then(responseBody),
    verifyPayment: (vivaTransactionID: string):
        Promise<VivaWalletVerification> => apiInstance
            .get(VIVAWALLET_TRANSACTION_VERIFICATION + "?" + vivaTransactionID,
                { headers: { 'Content-Type': 'application/json' } })
            .then(sleep(100)).then(responseBody)
}

const Vendor = {
    checkID: (vendorId: string | string[]): Promise<Name> => apiInstance.get(VENDOR_CHECK_ID + vendorId + '/').then(sleep(100)).then(responseBody)
}

export default {
    SettingsConfiguration,
    VivaWallet,
    Vendor,
}
