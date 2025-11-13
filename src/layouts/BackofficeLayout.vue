<script setup lang="ts">
import WaitingAnimation from '@/components/WaitingAnimation.vue'
import keycloak from '@/keycloak/keycloak'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore } from '@/stores/settings'
import {
  faArrowRightFromBracket,
  faBagShopping,
  faDungeon,
  faFileLines,
  faSliders,
  faSplotch,
  faUserGroup,
  faMapLocation,
  faAreaChart
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, watch, ref } from 'vue'

const keycloakStore = useKeycloakStore()
const settingsStore = useSettingsStore()
settingsStore.getSettingsFromApi()
const settings = computed(() => settingsStore.settings)
const authenticated = computed(() => keycloakStore.authenticated)
// remove the last / from the URL
const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')

const logo = computed(() => {
  if (settings.value.Logo && settings.value.Logo !== '') {
    // if the logo does not have a / at the beginning, add it
    if (typeof settings.value.Logo === 'string') {
      if (!settings.value.Logo.startsWith('/')) {
        return apiUrl + '/' + settings.value.Logo
      }

      return apiUrl + settings.value.Logo
    } else {
      return apiUrl + '/img/logo.png'
    }
  } else {
    return apiUrl + '/img/logo.png'
  }
})

// mobile sidebar state
const mobileMenuOpen = ref(false)

onMounted(() => {
  if (authenticated.value) {
    settingsStore.getSettingsFromApi()
  } else {
    watch(authenticated, () => {
      settingsStore.getSettingsFromApi()
    })
  }
})
</script>

<template>
  <div>
    <div v-if="authenticated">
      <div class="backoffice-layout h-screen flex">
        <div class="h-full flex-none">
          <button
            class="mobile-menu-btn md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white dark:bg-slate-800 shadow"
            aria-label="Toggle menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            {{ mobileMenuOpen ? '✖' : '☰' }}
          </button>
          <div
            class="sidemenu t-0 left-0 top-0 z-40 overflow-y-auto border-r border-gray-200 dark:border-slate-700 w-[300px]"
            :class="{ open: mobileMenuOpen }"
          >
            <!-- mobile hamburger button -->

            <!-- overlay for mobile when menu is open -->
            <div
              v-if="mobileMenuOpen"
              class="mobile-overlay md:hidden fixed inset-0 bg-black/40 z-30"
              @click="mobileMenuOpen = false"
            ></div>

            <div
              class="sidemenu-inner t-0 l-0 h-full flex-none flex flex-col justify-start items-start pr-5 pl-4 border-gray-600 border-b space-y-3 pb-5 customcolor"
            >
              <div class="sidemenu-item object-center">
                <img
                  :src="logo"
                  alt="Newspaper logo"
                  class="logo mx-auto my-5"
                  width="270"
                  height="auto"
                />
              </div>
              <RouterLink to="/backoffice/vendorsummary">
                <button
                  class="flex justify-start w-full space-x-4 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faUserGroup" />
                  <p class="text-base leading-4">{{ $t('menuVendors') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/credits" class-name="sidemenu-link">
                <button
                  class="flex justifyy-start items-center w-full space-x-5 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faBagShopping" />
                  <p class="text-base leading-4">{{ $t('menuCredits') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/payouts" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faFileLines" />

                  <p class="text-base leading-4">{{ $t('menuPayouts') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/sales" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-5 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faDungeon" />

                  <p class="text-base leading-4">{{ $t('menuSales') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/payments" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faBagShopping" />

                  <p class="text-base leading-4">{{ $t('menuAccounting') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/productsettings" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faSplotch" />

                  <p class="text-base leading-4">{{ $t('menuProducts') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/settings/update" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faSliders" />

                  <p class="text-base leading-4">{{ $t('menuSettings') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/map" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-5 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faMapLocation" />

                  <p class="text-base leading-4">{{ $t('menuMap') }}</p>
                </button>
              </RouterLink>
              <RouterLink to="/backoffice/statistics" class-name="sidemenu-link">
                <button
                  class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                >
                  <font-awesome-icon :icon="faAreaChart" />

                  <p class="text-base leading-4">{{ $t('menuStatistics') }}</p>
                </button>
              </RouterLink>
              <button
                class="flex justify-start items-center w-full space-x-6 focus:outline-none customcolor focus:text-indigo-400 pr-5 pb-1 rounded"
                @click="keycloak.keycloak?.logout()"
              >
                <font-awesome-icon :icon="faArrowRightFromBracket" />

                <p class="text-base leading-4">{{ $t('Logout') }}</p>
              </button>
              <div class="customcolor mt-10 user-loggedin">
                <p v-if="keycloakStore.username">
                  {{ keycloakStore.username }} {{ $t('userLoggedIn') }}
                </p>
                <p v-else>{{ $t('userNotLoggedIn') }}</p>
              </div>
              <select
                v-model="$i18n.locale"
                class="h-[40px] w-[70px] customcolor border-2 customborder font-semibold rounded-full text-center mt-4 mr-4 pl-2 text-sm"
              >
                <option value="en">EN</option>
                <option value="de">DE</option>
              </select>
            </div>
          </div>

          <div class="main-container grow h-full flex flex-col">
            <div class="header-slot w-full flex-none pl-3">
              <slot name="header"> </slot>
            </div>
            <div class="main-slot grow">
              <slot name="main"> </slot>
            </div>
          </div>
          <footer>
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </div>
    <div v-else>
      <div
        id="initial-loader"
        style="
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 2000;
          background-color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <WaitingAnimation />
      </div>
    </div>
  </div>
</template>

<style>
.customcolor {
  background-color: v-bind(settingsStore.settings.Color);
  color: v-bind(settingsStore.settings.FontColor);
}
.customborder {
  border-color: v-bind(settingsStore.settings.FontColor);
}
</style>

<style scoped>
.sidemenu-link {
  text-align: left;
}

/* Make the left side menu fixed (non-scrolling) and let the main content scroll */
.sidemenu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 300px; /* fixed width for sidebar */
  overflow-y: auto; /* allow sidebar inner scrolling if items overflow */
  z-index: 40;
}

.main-container {
  margin-left: 300px; /* space for fixed sidebar */
  width: calc(100vw - 300px); /* use the rest of the width beside the sidebar */
  height: 100vh;
  overflow: auto; /* main area scrolls independently */
}

.header-slot {
  text-align: left;
  border-radius: 5px;
  z-index: 50;
  max-width: calc(100vw - 300px);
  min-height: 80px;
}
.main-slot {
  text-align: left;
  border-radius: 5px;
  width: 100%;
  padding: 20px;
  background-color: #f2f2f2;
  display: inline-table;
}

footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: left;
  margin-top: 50px;
  padding-top: 50px;
}
.logo.mx-auto.my-5 {
  min-height: 70px;
}
.user-loggedin {
  max-width: 270px;
}
.sidemenu button {
  cursor: pointer;
}
.sidemenu button:hover {
  text-decoration: underline;
}

/* Mobile: hide sidebar by default, slide in when open
@media (max-width: 767px) {
  .sidemenu {
    transform: translateX(-100%);
    transition: transform 0.28s ease-in-out;
    width: 260px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .sidemenu.open {
    transform: translateX(0);
  }

  .main-container {
    margin-left: 0;
    width: 100%;
  }
} */
</style>

<style lang="scss">
.backoffice-layout {
  tbody {
    tr:hover {
      background-color: #b3ceb3;
    }
  }
}
</style>
