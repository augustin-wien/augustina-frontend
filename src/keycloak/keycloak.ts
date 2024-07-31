import Keycloak from 'keycloak-js'
import { fetchSettings } from '@/api/api'

type KeycloakInstnace = {
  initailizedKeycloak: boolean
  keycloak: Keycloak | undefined
}

const keycloak: KeycloakInstnace = {
  initailizedKeycloak: false,
  keycloak: undefined
}

export const initKeycloak = async () => {
  if (keycloak.keycloak == undefined) {
    // get keycloak configuration from server
    const settings = await (await fetchSettings()).data

    if (!settings) {
      return
    }

    const instance = new Keycloak({
      url: settings.Keycloak.URL,
      realm: settings.Keycloak.Realm,
      clientId: 'frontend'
    })

    keycloak.keycloak = instance
  }

  keycloak.keycloak.onAuthError = () => {
    console.log('onAuthError')
  }

  keycloak.keycloak.onAuthRefreshSuccess = () => {
    console.log('onAuthRefreshSuccess')
  }

  keycloak.keycloak.onAuthRefreshError = () => {
    console.log('onAuthRefreshError')
  }

  keycloak.keycloak.onAuthLogout = () => {
    console.log('onAuthLogout')
    if (!keycloak.keycloak) return

    keycloak.keycloak.logout()
  }

  keycloak.keycloak.onTokenExpired = () => {
    console.log('onTokenExpired')

    if (!keycloak.keycloak) return

    keycloak.keycloak.updateToken(100).then((refreshed) => {
      console.log('refreshed', refreshed)
    })
  }

  keycloak.keycloak.onReady = (authenticated) => {
    console.log('onReady', authenticated)
    if (!keycloak.keycloak) return

    if (!authenticated) {
      keycloak.keycloak.login({
        locale: 'de',
        redirectUri: window.location.origin + window.location.pathname + '/'
      })
    }
  }

  keycloak.initailizedKeycloak = true
  return keycloak.keycloak.init({
    onLoad: 'check-sso',
    flow: 'implicit'
  })
}
export default keycloak
