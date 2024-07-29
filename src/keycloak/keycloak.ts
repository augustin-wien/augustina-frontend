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
    keycloak.keycloak.logout()
  }

  keycloak.keycloak.onTokenExpired = () => {
    console.log('onTokenExpired')

    keycloak.keycloak.updateToken(100).then((refreshed) => {
      console.log('refreshed', refreshed)
    })
  }

  keycloak.keycloak.onReady = (authenticated) => {
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
