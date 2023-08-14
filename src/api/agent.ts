import type { Settings } from '@/models/settings'
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'
import axios, { type AxiosResponse } from 'axios'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => axios.get(import.meta.env.VITE_SETTINGS_API_URL).then(sleep(1000)).then(responseBody)
}

const VivaWallet = {
    postPrice: (price: number): Promise<VivaWalletResponse> => axios.post(import.meta.env.VITE_VIVAWALLET_TRANSACTION_ORDER, {amount: price}, {headers: {'Content-Type': 'application/json'}}).then(sleep(100)).then(responseBody),
    verifyPayment: (vivaTransactionID: string): Promise<VivaWalletVerification> => axios.post(import.meta.env.VITE_VIVAWALLET_TRANSACTION_VERIFICATION, {transactionID: vivaTransactionID}, {headers: {'Content-Type': 'application/json'}}).then(sleep(100)).then(responseBody)
}

export default{
    SettingsConfiguration,
    VivaWallet,
}
