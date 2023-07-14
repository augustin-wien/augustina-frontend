import type { Settings } from '@/models/settings'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import axios, { type AxiosResponse } from 'axios'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => axios.get('http://localhost:3000/api/settings/').then(sleep(1000)).then(responseBody)
}

const StripeLoad = {
    //public Key will become an env variable
    load: (): Promise<Stripe | null> => loadStripe("pk_test_51NTszUJEpEVZWKtc2yNFPJ9DYSmhNnf04vCUmbM3fMS94WK2w1YuhiTcxMIti8p3etufbrsr1oJpG2OUaLUmNUTU00cxAmOXLZ")
}

export default{
    SettingsConfiguration,
    StripeLoad
}