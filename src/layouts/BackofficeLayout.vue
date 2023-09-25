<template>
  <div className="backoffice-layout container h-screen">
    <div className="justify-start flex flex-row align-center">
      <div
        className="sidemenu h-screen grid grid-cols-1 text-lg text-center bg-lime-600 text-white space-y-3 p-3"
      >
        <div className="sidemenu-item object-center">
          <img src="../assets/logo.svg" alt="Augustin logo" className="logo mx-auto my-5" width="270" height="150" />
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/vendorsummary" className="sidemenu-link">
            <span className="sidemenu-text">VerkäuferInnen</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/credits" className="sidemenu-link">
            <span className="sidemenu-text">Auszahlungen</span>
          </RouterLink>
        </div>

        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/accounting" className="sidemenu-link">
            <span className="sidemenu-text">Buchhaltung</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/logs" className="sidemenu-link">
            <span className="sidemenu-text">Logbuch</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/inbox" className="sidemenu-link">
            <span className="sidemenu-text">Eingang</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/settings" className="sidemenu-link">
            <span className="sidemenu-text">Einstellungen</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <RouterLink to="/backoffice/productsettings" className="sidemenu-link">
            <span className="sidemenu-text">Produkte</span>
          </RouterLink>
        </div>
        <hr />
        <div className="sidemenu-item">
          <button className="sidemenu-link btn" @click="keycloak.keycloak.logout">
            <span className="sidemenu-text">Abmelden</span>
          </button>
        </div>
        <hr />
        <p v-if="loggedInUser">{{ loggedInUser }} ist eingeloggt</p>
        <p v-else>Not logged in</p>
      </div>
    </div>

    <main className="main-container flex items-center content-center top-2">
      <slot name="main"> </slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import keycloak from '@/keycloak/keycloak'
import { onMounted } from 'vue'
import { ref } from 'vue'

const loggedInUser = ref<string | null>(null)
onMounted(() => {
  // display the preferred_username of the logged-in user in the variable loggedInUser
  if (keycloak.keycloak.tokenParsed && keycloak.keycloak.tokenParsed.preferred_username) {
    loggedInUser.value = keycloak.keycloak.tokenParsed.preferred_username
  }
})
</script>

<style lang="scss">
.container {
  display: flex;
}

.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

p {
  font-size: 10px;
}
</style>