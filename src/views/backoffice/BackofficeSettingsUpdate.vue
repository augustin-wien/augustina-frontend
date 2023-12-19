<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore, type Settings } from '@/stores/settings'
import { useKeycloakStore } from '@/stores/keycloak'
import { useItemsStore } from '@/stores/items'
import toast from '@/components/ToastMessage.vue'
import router from '@/router'

const settingsStore = useSettingsStore()
const storeItems = useItemsStore()
const keycloakStore = useKeycloakStore()

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    storeItems.getItems()
    settingsStore.getSettingsFromApi()
    updatedSettings.value = settingsStore.settings
  } else {
    watch(authenticated, () => {
      storeItems.getItems()
      settingsStore.getSettingsFromApi()
      updatedSettings.value = settingsStore.settings
    })
  }
})

const settings = computed(() => settingsStore.settings)
const items = computed(() => storeItems.items)

watch(settings, (newVal) => {
  if (newVal) {
    updatedSettings.value = newVal
  }
})

const updatedSettings = ref<Settings>({
  Logo: '',
  FontColor: '',
  Color: '',
  MainItem: 1,
  OrgaCoversTransactionCosts: false,
  ID: 0,
  MainItemDescription: '',
  MainItemName: '',
  MainItemPrice: 0,
  MainItemImage: '',
  MaxOrderAmount: 0
})

const updateSettings = async () => {
  try {
    // This logic will execute when the "Bestätigen" button is clicked
    await settingsStore.updateSettings(updatedSettings.value)
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
  updatedSettings.value.Logo = event.target.files[0]
  newLogo.value = URL.createObjectURL(event.target.files[0])
}

const newLogo = ref('')

const url = import.meta.env.VITE_API_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        {{ $t('menuSettings') }} {{ $t('change') }}
      </h1></template
    >
    <template #main>
      <div class="main">
        <div v-if="settings" class="w-full max-w-l mx-auto mt-4">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ $t('menuSettings') }} {{ $t('change') }}</h1>
            <button
              class="px-2 rounded-full bg-red-600 text-white font-bold"
              @click="router.push('/backoffice/settings')"
            >
              X
            </button>
          </div>
          <form
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            @submit.prevent="updateSettings"
          >
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="logo"
                >Logo:</label
              >
              <div class="flex flex-row">
                <img
                  v-if="
                    (updatedSettings && typeof updatedSettings.Logo === 'string') ||
                    !updatedSettings?.Logo
                  "
                  :src="
                    updatedSetting?.Logo && settingsupdatedSetting?.Logo !== ''
                      ? url + updatedSetting.Logo
                      : url + 'img/logo.png'
                  "
                  alt="Augustin logo"
                  class="logo mx-auto my-5"
                  width="200"
                  height="auto"
                />
                <img
                  v-else
                  :src="newLogo"
                  alt="Augustin logo2"
                  class="logo mx-auto my-5"
                  width="200"
                  height="auto"
                />
                <input
                  id="logo"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="file"
                  accept="image/png"
                  @change="updateLogo"
                />
              </div>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color"
              >{{ $t('color') }}:</label
            >
            <div class="flex flex-row">
              <input
                id="color"
                v-model="updatedSettings.Color"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color"
              >{{ $t('fontColor') }}:</label
            >
            <div class="flex flex-row">
              <input
                id="color"
                v-model="updatedSettings.FontColor"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mainItem"
              >{{ $t('mainProduct') }}:</label
            >
            <div class="flex flex-row">
              <select
                id="mainItem"
                v-model="updatedSettings.MainItem"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option v-for="item in items" :key="item.ID" :value="item.ID">
                  {{ item.Name }}
                </option>
              </select>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
              >{{ $t('transactionCost') }}:</label
            >
            <div class="flex flex-row justify-evenly">
              <span>
                <label for="RefundFees">{{ $t('yes') }}</label>
                <input
                  id="RefundFees"
                  v-model="updatedSettings.OrgaCoversTransactionCosts"
                  type="radio"
                  checked
                  name="RefundFees"
                  value="true"
                />
              </span>
              <span>
                <label for="RefundFees">{{ $t('no') }}</label>
                <input
                  id="RefundFees"
                  v-model="updatedSettings.OrgaCoversTransactionCosts"
                  type="radio"
                  name="RefundFees"
                  value="false"
                />
              </span>
            </div>
            <div class="flex place-content-center">
              <router-link to="/backoffice/settings/">
                <button
                  type="submit"
                  class="p-3 rounded-full bg-lime-600 text-white"
                  @click="updateSettings()"
                >
                  {{ $t('confirmation') }}
                </button>
              </router-link>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
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
