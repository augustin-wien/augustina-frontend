import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import keycloak from './keycloak/keycloak'


keycloak.init({
    onLoad: 'check-sso',
    flow: 'implicit'
}).then(() => {
    console.log("keycloak init")
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    app.mount('#app')
}).catch((error) => {
    console.log(error)
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    app.mount('#app')
})


