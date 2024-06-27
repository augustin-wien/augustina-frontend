import Keycloak from 'keycloak-js'

const keycloak = {
  initailizedKeycloak: false,
  keycloak: new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL as string,
    realm: 'augustin',
    clientId: 'frontend'
  })
}

export const initKeycloak = async () => {
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
    keycloak.keycloak.logout()
  }

  keycloak.keycloak.onTokenExpired = () => {
    /* eslint-disable no-console */
    console.log('onTokenExpired')

    keycloak.keycloak.updateToken(100).then((refreshed) => {
      /* eslint-disable no-console */
      console.log('refreshed', refreshed)
    })
  }

  keycloak.keycloak.onReady = (authenticated) => {
    /* eslint-disable no-console */
    console.log('onReady', authenticated)

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
