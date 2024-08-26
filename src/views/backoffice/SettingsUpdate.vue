<script lang="ts" setup>
import toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore, type Settings } from '@/stores/settings'
import { computed, onMounted, ref, watch } from 'vue'

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
  MaxOrderAmount: 0,
  WebshopIsClosed: false,
  AGBUrl: '',
  MaintainanceModeHelpUrl: '',
  NewspaperName: '',
  QRCodeLogoImgUrl: '',
  QRCodeUrl: '',
  VendorNotFoundHelpUrl: '',
  VendorEmailPostfix: '',
  MapCenterLat: 0.1,
  MapCenterLong: 0.1,
  Keycloak: null
})

const updateSettings = async () => {
  try {
    // This logic will execute when the "Bestätigen" button is clicked
    await settingsStore.updateSettings(updatedSettings.value).then(() => {
      showToast('success', 'Einstellungen erfolgreich aktualisiert')
      router.push({ name: 'Backoffice Settings' })
    })
  } catch (error) {
    // eslint-disable-next-line no-console
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
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuSettings') }} {{ $t('change') }}</h1>
    </template>
    <template #main>
      <div class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div v-if="settings" class="w-full max-w-l mx-auto">
            <div class="flex place-content-center justify-between">
              <span />
              <button
                class="px-2 rounded-full font-bold"
                @click="router.push('/backoffice/settings')"
              >
                X
              </button>
            </div>
            <div class="form">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="newspapername"
                  >{{ $t('Newspaper name') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="newspapername"
                    v-model="updatedSettings.NewspaperName"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
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
                      updatedSettings?.Logo && updatedSettings?.Logo !== ''
                        ? url + updatedSettings.Logo
                        : url + 'img/logo.png'
                    "
                    alt="Newspaper logo"
                    class="logo mx-auto my-5"
                    width="200"
                    height="auto"
                  />
                  <img
                    v-else
                    :src="newLogo"
                    alt="Newspaper logo2"
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
              <div class="">
                <span class="me-4">
                  <label class="me-1" for="RefundFees">{{ $t('yes') }}</label>
                  <input
                    id="RefundFees"
                    v-model="updatedSettings.OrgaCoversTransactionCosts"
                    type="radio"
                    checked
                    name="RefundFees"
                    :value="true"
                  />
                </span>
                <span class="me-4">
                  <label class="me-1" for="RefundFees">{{ $t('no') }}</label>
                  <input
                    id="RefundFees"
                    v-model="updatedSettings.OrgaCoversTransactionCosts"
                    type="radio"
                    name="RefundFees"
                    :value="false"
                  />
                </span>
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                >{{ $t('Webshop closed') }}:</label
              >
              <div class="">
                <span class="me-4">
                  <label class="me-1" for="WebshopClosed">{{ $t('yes') }}</label>
                  <input
                    id="WebshopClosed"
                    v-model="updatedSettings.WebshopIsClosed"
                    type="radio"
                    checked
                    name="WebshopClosed"
                    :value="true"
                  />
                </span>
                <span>
                  <label class="me-1" for="WebshopClosed">{{ $t('no') }}</label>
                  <input
                    id="WebshopClosed"
                    v-model="updatedSettings.WebshopIsClosed"
                    type="radio"
                    name="WebshopClosed"
                    :value="false"
                  />
                </span>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="agburl"
                  >{{ $t('AGB URL') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="agburl"
                    v-model="updatedSettings.AGBUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="maintainanceurl"
                  >{{ $t('URL for maintenance') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="maintainanceurl"
                    v-model="updatedSettings.MaintainanceModeHelpUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcodelogourl"
                  >{{ $t('QR Code Logo path') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="qrcodelogourl"
                    v-model="updatedSettings.QRCodeLogoImgUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcodeurl"
                  >{{ $t('QR Code url') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="qrcodeurl"
                    v-model="updatedSettings.QRCodeUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                  for="vendornotfoundhelpurl"
                  >{{ $t('LicenseID-not-found-URL') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="vendornotfoundhelpurl"
                    v-model="updatedSettings.VendorNotFoundHelpUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                  for="vendoremaolpostix"
                  >{{ $t('Email ending domain') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="vendoremaolpostix"
                    v-model="updatedSettings.VendorEmailPostfix"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mapcenterlat"
                  >{{ $t('Map center latitude') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="mapcenterlat"
                    v-model="updatedSettings.MapCenterLat"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mapcenterlong"
                  >{{ $t('Map center longitude') }}:</label
                >
                <div class="flex flex-row">
                  <input
                    id="mapcenterlong"
                    v-model="updatedSettings.MapCenterLong"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div class="flex place-content-center">
                <button
                  id="saveSettings"
                  type="submit"
                  class="p-3 rounded-full customcolor"
                  @click="updateSettings()"
                >
                  {{ $t('confirmation') }}
                </button>
              </div>
            </div>
          </div>
          <Toast v-if="toast" :toast="toast" />
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
