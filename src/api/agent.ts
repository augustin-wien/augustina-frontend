import type { Settings } from '@/models/settings'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import axios, { type AxiosResponse } from 'axios'

const responseBody = (response: AxiosResponse) => response.data

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => axios.get('http://localhost:3000/api/settings/').then(sleep(1000)).then(responseBody)
}

export default{
    SettingsConfiguration,
}