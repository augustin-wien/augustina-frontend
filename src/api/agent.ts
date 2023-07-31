import type { Settings } from '@/models/settings'
import axios, { type AxiosResponse } from 'axios'

const responseBody = (response: AxiosResponse) => response.data
const responseViva = (response: AxiosResponse) => response.data 

const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))

const SettingsConfiguration = {
    current: (): Promise<Settings> => axios.get(import.meta.env.VITE_SETTINGS_API_URL).then(sleep(1000)).then(responseBody)
}

export default{
    SettingsConfiguration,
}