import Keycloak, { type KeycloakLoginOptions } from 'keycloak-js'
import { fetchSettings } from '@/api/api'
import i18n from '@/locales/i18n'

type KeycloakInstnace = {
  initailizedKeycloak: boolean
  keycloak: Keycloak | undefined
}

const keycloak: KeycloakInstnace = {
  initailizedKeycloak: false,
  keycloak: undefined
}

// Never pass location.href: it can still carry the '#state=...' fragment of an auth callback,
// which Keycloak rejects as redirect_uri. Collapse repeated slashes: a URL that already contains '//' (old bookmark,
// earlier redirect) would otherwise be reflected back by Keycloak and match no route.
const redirectUri = () =>
  window.location.origin +
  (window.location.pathname + '/').replace(/\/{2,}/g, '/') +
  window.location.search

export const login = (options: KeycloakLoginOptions = {}) =>
  keycloak.keycloak?.login({ locale: i18n.global.locale, redirectUri: redirectUri(), ...options })

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

    keycloak.keycloak
      .updateToken(100)
      .then((refreshed) => {
        /* eslint-disable no-console */
        console.log('refreshed', refreshed)
      })
      .catch(() => {
        login()
      })
  }

  keycloak.keycloak.onReady = (authenticated) => {
    /* eslint-disable no-console */
    console.log('onReady', authenticated)
    if (!keycloak.keycloak) return

    if (!authenticated) {
      login()
    }
  }

  keycloak.initailizedKeycloak = true
  return keycloak.keycloak.init({
    onLoad: 'check-sso'
  })
}
export default keycloak
