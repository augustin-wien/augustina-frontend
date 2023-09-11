import type { Settings } from '@/models/settings'
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'
import { type AxiosResponse } from 'axios'
import { VIVAWALLET_TRANSACTION_ORDER, SETTINGS_API_URL, VIVAWALLET_TRANSACTION_VERIFICATION } from '@/api/endpoints'
import { apiInstance } from './api'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => apiInstance.get(SETTINGS_API_URL).then(responseBody)
}

const VivaWallet = {
    postPrice: (price: number): Promise<VivaWalletResponse> => apiInstance.post(VIVAWALLET_TRANSACTION_ORDER, { amount: price }, { headers: { 'Content-Type': 'application/json' } }).then(sleep(100)).then(responseBody),
    verifyPayment: (vivaTransactionID: string):
        Promise<VivaWalletVerification> => apiInstance
            .post(VIVAWALLET_TRANSACTION_VERIFICATION,
                { transactionID: vivaTransactionID },
                { headers: { 'Content-Type': 'application/json' } })
            .then(sleep(100)).then(responseBody)
}

export default {
    SettingsConfiguration,
    VivaWallet,
}