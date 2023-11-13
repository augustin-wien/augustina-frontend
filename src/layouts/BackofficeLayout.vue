<template>
  <div>
    <div className="backoffice-layout h-screen" v-if="authenticated">
      <div className="">
        <div
          className="sidemenu fixed t-0 l-0 h-full w-100 flex flex-col justify-start items-start pr-5 pl-4 border-gray-600 border-b space-y-3 pb-5 bg-lime-600">
          <div className="sidemenu-item object-center">
            <img :src="apiUrl + 'img/logo.png'" alt="Augustin logo" className="logo mx-auto my-5" width="270"
              height="150" />
          </div>
          <RouterLink to="/backoffice/vendorsummary">
            <button
              class="flex justify-start w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faUserGroup" />
              <p class="text-base leading-4">{{ $t('menuVendors') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/credits" className="sidemenu-link">
            <button
              class="flex justifyy-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faBagShopping" />
              <p class="text-base leading-4">{{ $t('menuCredits') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/payouts" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faFileLines" />

              <p class="text-base leading-4">{{ $t('menuPayouts') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/sales" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faDungeon" />

              <p class="text-base leading-4">{{ $t('menuSales') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/payments" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faBagShopping" />

              <p class="text-base leading-4">{{ $t('menuAccounting') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/productsettings" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faSplotch" />

              <p class="text-base leading-4">{{ $t('menuProducts') }}</p>
            </button>
          </RouterLink>
          <RouterLink to="/backoffice/settings" className="sidemenu-link">
            <button
              class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded">
              <font-awesome-icon :icon="faSliders" />

              <p class="text-base leading-4">{{ $t('menuSettings') }}</p>
            </button>
          </RouterLink>

          <button
            class="flex justify-start items-center w-full space-x-6 focus:outline-none text-white focus:text-indigo-400 pr-5 pb-1 rounded"
            @click="keycloak.keycloak.logout">
            <font-awesome-icon :icon="faArrowRightFromBracket" />

            <p class="text-base leading-4">{{ $t('Logout') }}</p>
          </button>
          <div class="text-white mt-10">
            <p v-if="keycloakStore.username">
              {{ keycloakStore.username }} {{ $t('userLoggedIn') }}
            </p>
            <p v-else>{{ $t('userNotLoggedIn') }}</p>
          </div>
          <select
            class="h-[40px] w-[70px] bg-lime-700 border-2 border-white font-semibold rounded-full text-white text-center mt-4 mr-4 pl-2 text-sm"
            v-model="$i18n.locale">
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
        </div>
      </div>

      <div className="main-container flex">
        <div class="header-slot fixed">
          <slot name="header"> </slot>
        </div>
        <div class="main-slot">
          <slot name="main"> </slot>
        </div>
      </div>
      <footer>
        <slot name="footer"></slot>
      </footer>
    </div>
    <div v-else>
      <div id="initial-loader" style="
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 2000;
          background-color: #65a30d;
          display: flex;
          justify-content: center;
          align-items: center;
        ">
        <!--  SVG by Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL  -->
        <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)" stroke-width="2">
              <circle stroke-opacity=".5" cx="18" cy="18" r="18"></circle>
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s"
                  repeatCount="indefinite"></animateTransform>
              </path>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import keycloak from '@/keycloak/keycloak'
import { useKeycloakStore } from '@/stores/keycloak'
import {
  faArrowRightFromBracket,
  faBagShopping,
  faDungeon,
  faFileLines,
  faSliders,
  faSplotch,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'

const keycloakStore = useKeycloakStore()

const authenticated = computed(() => keycloakStore.authenticated)

const apiUrl = import.meta.env.VITE_API_URL
</script>

<style lang="scss" scoped>
.main-container {
  padding-left: 8px;
  margin-left: 300px;
  width: calc(100% - 310px);
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
  background: #f2f9f1;
  width: calc(100% - 310px);
  z-index: 50;
}

.main-slot {
  text-align: left;
  border-radius: 5px;
  margin-top: 70px;
  width: 100%;
  padding: 50px;
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
<style lang="scss">
.backoffice-layout {
  tbody {
    tr:hover {
      background-color: #b3ceb3;
    }
  }
}
</style>
