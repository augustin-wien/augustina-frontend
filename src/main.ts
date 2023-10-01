import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

const i18n = createI18n({
    locale: "de",
    messages: {
        de: {
            buyItem: "Zeitung kaufen bei:",
            newspaper: "Print Zeitung",
            next: "Weiter",

            donation: "Spende eingeben:",
            edit: "Eingabe",
            notToday: "Heute nicht",

            confirm: "Bezahlung bestätigen:",
            agreement: "Mit kauf akzeptiere ich die ",
            terms: "AGBs",

            symbol: "Symbol zeigen"
        },
        en: {
            buyItem: "Buy a newspaper from:",
            newspaper: "Newspaper",
            next: "Next",

            donation: "Give a donation:",
            edit: "Edit",
            notToday: "Not today",

            confirm: "Confirm your order:",
            agreement: "With this purchase, I confirm the ",
            terms: "terms and conditions",

            symbol: "Show the symbol"
        }
    }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')



