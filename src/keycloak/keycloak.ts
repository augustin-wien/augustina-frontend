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
    /* eslint-disable no-console */
    console.log('onAuthError')
  }

  keycloak.keycloak.onAuthRefreshSuccess = () => {
    /* eslint-disable no-console */
    console.log('onAuthRefreshSuccess')
  }

  keycloak.keycloak.onAuthRefreshError = () => {
    /* eslint-disable no-console */
    console.log('onAuthRefreshError')
  }

  keycloak.keycloak.onAuthLogout = () => {
    /* eslint-disable no-console */
    console.log('onAuthLogout')
    if (!keycloak.keycloak) return

    keycloak.keycloak.logout()
  }

  keycloak.keycloak.onTokenExpired = () => {
    /* eslint-disable no-console */
    console.log('onTokenExpired')

    if (!keycloak.keycloak) return

    keycloak.keycloak.updateToken(100).then((refreshed) => {
      /* eslint-disable no-console */
      console.log('refreshed', refreshed)
    })
  }

  keycloak.keycloak.onReady = (authenticated) => {
    /* eslint-disable no-console */
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
