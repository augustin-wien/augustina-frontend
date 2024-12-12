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
import { computed, onMounted, watch } from 'vue'

const keycloakStore = useKeycloakStore()
const settingsStore = useSettingsStore()
settingsStore.getSettingsFromApi()
const settings = computed(() => settingsStore.settings)
const authenticated = computed(() => keycloakStore.authenticated)
const apiUrl = import.meta.env.VITE_API_URL

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
    <div v-if="authenticated" className="backoffice-layout h-screen flex ">
      <div class="h-full flex-none w-100">
        <div
          className="sidemenu fixed t-0 l-0 h-full w-100 flex-none flex flex-col justify-start items-start pr-5 pl-4 border-gray-600 border-b space-y-3 pb-5 customcolor"
        >
          <div className="sidemenu-item object-center">
            <img
              v-if="typeof settings.Logo === 'string'"
              :src="
                settings.Logo && settings.Logo !== ''
                  ? apiUrl + settings.Logo
                  : apiUrl + 'img/logo.png'
              "
              alt="Newspaper logo"
              class="logo mx-auto my-5"
              width="270"
              height="auto"
            />
            <img
              v-else
              :src="
                typeof settings.Logo == 'string' ? apiUrl + settings.Logo : apiUrl + 'img/logo.png'
              "
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

      <div className="main-container grow h-full flex">
        <div class="header-slot fixed flex-none">
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
</style>

<style scoped>
.main-container {
  padding-left: 8px;
  margin-left: 300px;
}

.customcolor {
  background-color: v-bind(settingsStore.settings.Color);
  color: v-bind(settingsStore.settings.FontColor);
}

.customborder {
  border-color: v-bind(settingsStore.settings.FontColor);
}

.sidemenu-link {
  text-align: left;
}

.header-slot {
  text-align: left;
  margin-bottom: 20px;
  padding-bottom: 20px;
  padding-left: 50px;
  border-radius: 5px;
  background: #fff;
  width: 100%;
  z-index: 50;
  max-width: calc(100vw - 300px);
  min-height: 80px;
}
.main-slot {
  text-align: left;
  border-radius: 5px;
  margin-top: 70px;
  width: 100%;
  padding: 50px;
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
