<template>
  <div>
    <div className="backoffice-layout h-screen" v-if="keycloakStore.authenticated">
      <div className="">
        <div
          className="sidemenu fixed t-0 l-0 h-full w-100 flex flex-col justify-start items-start pr-5 pl-4 border-gray-600 border-b space-y-3 pb-5 bg-lime-600"
        >
          <div className="sidemenu-item object-center">
            <img
              :src="apiUrl + 'img/logo.png'"
              alt="Augustin logo"
              className="logo mx-auto my-5"
              width="270"
              height="150"
            />
          </div>
          <RouterLink to="/backoffice/vendorsummary">
            <button
              class="flex justify-start w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faUserGroup" />
              <p class="text-base leading-4">VerkäuferInnen</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/credits" className="sidemenu-link">
            <button
              class="flex justifyy-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faBagShopping" />
              <p class="text-base leading-4">Auszahlungen</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/accounting" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faBagShopping" />

              <p class="text-base leading-4">Buchhaltung</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/logs" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faFileLines" />

              <p class="text-base leading-4">Logbuch</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/inbox" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faDungeon" />

              <p class="text-base leading-4">Eingang</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/productsettings" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faSplotch" />

              <p class="text-base leading-4">Produkte</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/settings" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            >
              <font-awesome-icon :icon="faSliders" />

              <p class="text-base leading-4">Einstellungen</p>
            </button>
          </RouterLink>

          <button
            class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            @click="keycloak.keycloak.logout"
          >
            <font-awesome-icon :icon="faArrowRightFromBracket" />

            <p class="text-base leading-4">Abmelden</p>
          </button>
          <div class="text-white mt-10">
            <p v-if="keycloakStore.username">{{ keycloakStore.username }} ist eingeloggt</p>
            <p v-else>Not logged in</p>
          </div>
        </div>
      </div>

      <main className=" flex">
        <div class="header-slot fixed">
          <slot name="header"> </slot>
        </div>
        <div class="main-slot">
          <slot name="main"> </slot>
        </div>
      </main>
      <footer>
        <slot name="footer"></slot>
      </footer>
    </div>
    <div v-else>
      <p>Not authenticated</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import keycloak from '@/keycloak/keycloak'
import { useKeycloakStore } from '@/stores/keycloak'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBagShopping,
  faFileLines,
  faDungeon,
  faSplotch,
  faUserGroup,
  faArrowRightFromBracket,
  faSliders
} from '@fortawesome/free-solid-svg-icons'

const keycloakStore = storeToRefs(useKeycloakStore())

watch(keycloakStore.isAuthenticated, (newVal) => {
  return newVal
})

const apiUrl = import.meta.env.VITE_API_URL
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  justify-content: flex-start;
  align-items: flex-start;
}

.sidemenu-link {
  text-align: left;
}
.header-slot {
  text-align: left;
  margin-bottom: 20px;
  padding-bottom: 20px;
  padding-left: 10px;
  border-radius: 5px;
  background: #f2f9f1;
  width: 100%;
}
.main-slot {
  text-align: left;
  border-radius: 5px;
  margin-top: 50px;
  padding-top: 50px;
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: left;
  margin-top: 50px;
  padding-top: 50px;
}
</style>
