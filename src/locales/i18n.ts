import { createI18n } from 'vue-i18n'
import en from './en.json'
import de from './de.json'

const i18n = createI18n({
    locale: "de",
    messages: {
        de: de,
        en: en
    }
})

export default i18n