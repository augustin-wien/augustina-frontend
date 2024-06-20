<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { computed, onMounted, watch } from 'vue'
import router from '@/router'

const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()
const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    settingsStore.getSettingsFromApi()
    itemsStore.getItems()
  } else {
    watch(authenticated, () => {
      settingsStore.getSettingsFromApi()
      itemsStore.getItems()
    })
  }
})

const settings = computed(() => settingsStore.settings)
const url = import.meta.env.VITE_API_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuSettings') }}</h1>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full max-w-l mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="container page-content space-x-2 mt-5">
            <div className="text-xl space-y-3 space-x-3">
              <div
                v-if="settings.ID"
                className="table-auto border-spacing-4 border-collapse text-left"
              >
                <tbody className="text-sm">
                  <tr>
                    <th className="p-3">Logo:</th>
                    <td className="p-3">
                      <img
                        v-if="typeof settings.Logo === 'string'"
                        :src="
                          settings.Logo && settings.Logo !== ''
                            ? url + settings.Logo
                            : url + 'img/logo.png'
                        "
                        alt="Augustin logo"
                        class="logo mx-auto my-5"
                        width="50"
                        height="20"
                      />
                      <img
                        v-else
                        :src="settings.Logo"
                        alt="Augustin logo"
                        class="logo mx-auto my-5"
                        width="50"
                        height="20"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('mainProduct') }}:</th>
                    <td className="p-3">
                      {{ settings.MainItem }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('transactionCost') }}:</th>
                    <td className="p-3">
                      {{ settings.OrgaCoversTransactionCosts }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('color') }}:</th>
                    <td className="p-3">
                      {{ settings.Color }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('fontColor') }}:</th>
                    <td className="p-3">
                      {{ settings.FontColor }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('maximum') }}</th>
                    <td className="p-3">
                      {{ settings.MaxOrderAmount }}
                    </td>
                  </tr>
                </tbody>
              </div>
              <div>
                <router-link to="/backoffice/settings/update">
                  <button class="p-2 rounded-full bg-lime-600 text-white mr-2">
                    {{ $t('change') }}
                  </button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>
