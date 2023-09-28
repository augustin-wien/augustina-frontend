<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4" v-if="settings">
          <h1 className="font-bold text-3xl mt-3 p-3">Einstellungen</h1>

          <form
            @submit.prevent="updateSettings"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="logo"
                >Logo:</label
              >
              <div class="flex flex-row">
                <img
                  :src="url + settings.Logo"
                  alt="Augustin logo"
                  class="logo mx-auto my-5"
                  width="50"
                  height="20"
                />
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  @change="updateLogo"
                  type="file"
                  id="logo"
                  accept="image/*"
                />
              </div>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color"
              >Farbe:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ settings.Color }}</span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedSettings.Color"
                type="text"
                id="color"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mainItem"
              >Hauptprodukt:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ settings.MainItem }}</span>
              <select
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedSettings.MainItem"
                id="mainItem"
                required
              >
                <option v-for="item in items" :key="item.ID" :value="item.ID">
                  {{ item.Name }}
                </option>
              </select>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
              >Übernahme Transaktionskosten:</label
            >
            <div class="flex flex-row justify-evenly">
              <span>
                <label for="RefundFees">Ja</label>
                <input
                  type="radio"
                  checked
                  id="RefundFees"
                  name="RefundFees"
                  value="true"
                  v-model="updatedSettings.RefundFees"
                />
              </span>
              <span>
                <label for="RefundFees">Nein</label>
                <input
                  type="radio"
                  id="RefundFees"
                  name="RefundFees"
                  value="false"
                  v-model="updatedSettings.RefundFees"
                />
              </span>
            </div>
            <div class="flex place-content-center">
              <button
                onsubmit="updateSettings()"
                type="submit"
                class="p-3 rounded-full bg-lime-600 text-white"
              >
                Bestätigen
              </button>
            </div>
          </form>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { settingsStore, type Settings } from '../stores/settings'
import { itemStore } from '@/stores/items'
import toast from '../components/ToastMessage.vue'

const store = settingsStore()
const storeItems = itemStore()

onMounted(() => {
  store.getSettingsFromApi()
  storeItems.getItems()
})

const settings = computed(() => store.settings)
const items = computed(() => storeItems.items)

watch(settings, (newVal) => {
  if (newVal) {
    updatedSettings.value = newVal
  }
})

const updatedSettings = ref<Settings>({
  Logo: '',
  Color: '',
  MainItem: 1,
  RefundFees: false,
  ID: 0
})

const updateSettings = async () => {
  try {
    // This logic will execute when the "Bestätigen" button is clicked
    await store.updateSettings(updatedSettings.value)
    showToast('success', 'Einstellungen erfolgreich aktualisiert')
  } catch (error) {
    console.error('Error updating settings:', error)
    showToast('error', 'Einstellungen konnten nicht aktualisiert werden')
  }
}

const showToast = (type: string, message: string) => {
  toast.value = { type, message }
  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const updateLogo = (event: any) => {
  // This logic will execute when a file is selected in the file input
  updatedSettings.value.Logo= event.target.files[0]
}

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
