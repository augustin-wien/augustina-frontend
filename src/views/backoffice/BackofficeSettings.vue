<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="container page-content space-x-2 mt-5">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <h1 className="font-bold text-3xl mt-3 p-3">Einstellungen</h1>

            <div className="table-auto border-spacing-4 border-collapse text-left" v-if="settings">
              <tbody className="text-sm">
                <tr>
                  <th className="text-2xl">Thema</th>
                  <th className="text-2xl">Aktuell</th>
                </tr>
                <tr>
                  <th className="p-3">Logo:</th>
                  <td className="p-3">
                    <img
                      :src="url + settings.Logo"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                      v-if="settings.Logo"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Hauptprodukt:</th>
                  <td className="p-3">
                    {{ settings.MainItem }}
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Transaktionskosten:</th>
                  <td className="p-3">
                    {{ settings.OrgaCoversTransactionCosts }}
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Farbe:</th>
                  <td className="p-3">
                    {{ settings.Color }}
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Schriftfarbe:</th>
                  <td className="p-3">
                    {{ settings.FontColor }}
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Maximale Bestellsumme</th>
                  <td className="p-3">
                    {{ settings.MaxOrderAmount }}
                  </td>
                </tr>
              </tbody>
            </div>
            <div>
              <router-link to="/backoffice/settings/update">
                <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
              </router-link>
            </div>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { settingsStore } from '@/stores/settings'
import { itemStore } from '@/stores/items'
import { computed, onMounted } from 'vue'

const store = settingsStore()
const storeItems = itemStore()

onMounted(() => {
  storeItems.getItems()
  store.getSettingsFromApi()
})

const settings = computed(() => store.settings)
const url = import.meta.env.VITE_API_URL
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
