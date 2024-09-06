<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { computed, onMounted, watch } from 'vue'

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
                    <th className="p-3">{{ $t('Newspaper name') }}</th>
                    <td id="newspapername_value" className="p-3">
                      {{ settings.NewspaperName }}
                    </td>
                  </tr>
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
                        alt="Newspaper logo"
                        class="logo mx-auto my-5"
                        width="50"
                        height="20"
                      />
                      <img
                        v-else
                        :src="settings.Logo"
                        alt="Newspaper logo"
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
                    <td className="p-3">{{ settings.MaxOrderAmount }} Cent</td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('AGB URL') }}</th>
                    <td className="p-3">
                      {{ settings.AGBUrl }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('Maintainence mode help URL') }}</th>
                    <td className="p-3">
                      {{ settings.MaintainanceModeHelpUrl }}
                    </td>
                  </tr>

                  <tr>
                    <th className="p-3">{{ $t('Logo path') }}</th>
                    <td className="p-3">
                      {{ settings.QRCodeLogoImgUrl }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('LicenseID-not-found-URL') }}</th>
                    <td className="p-3">
                      {{ settings.VendorNotFoundHelpUrl }}
                    </td>
                  </tr>

                  <tr>
                    <th className="p-3">{{ $t('Email ending domain') }}</th>
                    <td className="p-3">
                      {{ settings.VendorEmailPostfix }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('Webshop is closed') }}</th>
                    <td className="p-3">
                      {{ settings.WebshopIsClosed }}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-3">{{ $t('Map center') }}</th>
                    <td className="p-3">
                      {{ settings.MapCenterLat }}, {{ settings.MapCenterLong }}
                    </td>
                  </tr>
                </tbody>
              </div>
              <div class="flex justify-center">
                <router-link to="/backoffice/settings/update" class="mr-[6px]">
                  <button
                    id="editSettings"
                    class="py-2 px-4 text-[16px] rounded-full customcolor h-[44px]"
                  >
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

<style scoped>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}

.customcolor {
  background-color: v-bind(settingsStore.settings.Color);
  color: v-bind(settingsStore.settings.FontColor);
}
</style>
