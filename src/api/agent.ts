import type { Settings } from '@/models/settings'
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import axios, { type AxiosResponse } from 'axios'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'

const responseBody = (response: AxiosResponse) => response.data
const verified = (body: VivaWalletVerification) => body.verification

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => axios.get(import.meta.env.VITE_SETTINGS_API_URL).then(sleep(1000)).then(responseBody)
}

const VivaWallet = {
    postPrice: (price: number): Promise<VivaWalletResponse> => axios.post('http://localhost:3000/api/vivawallet/transaction_order/', {amount: price}, {headers: {'Content-Type': 'application/json'}}).then(sleep(100)).then(responseBody),
    verifyPayment: (vivaTransactionID: string): Promise<VivaWalletVerification> => axios.post('http://localhost:3000/api/vivawallet/transaction_verification/', {transactionID: vivaTransactionID}, {headers: {'Content-Type': 'application/json'}}).then(sleep(100)).then(responseBody)
}

export default{
    SettingsConfiguration,
    VivaWallet,
}
