<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore, type Settings } from '@/stores/settings'
import { computed, onMounted, ref, watch } from 'vue'
import QrCodeSettings from '@/components/QrCodeSettings.vue'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import StylesSettings from '@/components/settings/StylesSettings.vue'
import MailTemplatesSettings from '@/components/settings/MailTemplatesSettings.vue'

const settingsStore = useSettingsStore()
const storeItems = useItemsStore()
const keycloakStore = useKeycloakStore()

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    storeItems.getItems()
    settingsStore.getSettingsFromApi()
    updatedSettings.value = settingsStore.settings
    settingsStore.getStyleCss()
  } else {
    watch(authenticated, () => {
      storeItems.getItems()
      settingsStore.getSettingsFromApi()
      updatedSettings.value = settingsStore.settings
      settingsStore.getStyleCss()
    })
  }
})

const settings = computed(() => settingsStore.settings)
const items = computed(() => storeItems.items)

const styles = ref('')
styles.value = settingsStore.styles

settingsStore.getStyleCss()

watch(settings, (newVal) => {
  if (newVal) {
    updatedSettings.value = newVal
  }
})

const updatedSettings = ref<Settings>({
  Logo: '',
  Favicon: '',
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
  Keycloak: null,
  UseVendorLicenseIdInShop: false,
  QRCodeSettings: '',
  QRCodeEnableLogo: false,
  UseTipInsteadOfDonation: false,
  ShopLanding: false,
  DigitalItemsUrl: ''
})

// toast state for small success/error hints
const toast = ref<{ type: string; message: string } | null>(null)

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const updateQRCodeSettings = (settings: string) => {
  updatedSettings.value.QRCodeSettings = settings
}

const url = import.meta.env.VITE_API_URL

// QR code was previously a modal; now it's a tab
// const showQrCodeSettings = ref(false)

// refs to child components so parent can call exposed methods
const generalRef = ref<{ saveSettings?: () => void } | null>(null)
const stylesRef = ref<{ saveStyles?: () => void } | null>(null)

const saveGeneralFromParent = () => {
  const comp = generalRef.value
  if (comp && comp.saveSettings) comp.saveSettings()
}

// UI tab for settings page: 'general', 'styles' or 'qrcode'
const currentTab = ref<'general' | 'styles' | 'qrcode' | 'mailtemplates'>('general')
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuSettings') }}</h1>
    </template>
    <template #main>
      <div v-if="settingsStore.settings" class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div v-if="settings" class="w-full max-w-l mx-auto">
            <!-- Tabs: General settings and Custom CSS -->
            <div class="mb-4 flex gap-2">
              <button
                :class="
                  currentTab === 'general' ? 'px-4 py-2 bg-black text-white' : 'px-4 py-2 border'
                "
                @click="currentTab = 'general'"
              >
                {{ $t('General') }}
              </button>
              <button
                :class="
                  currentTab === 'styles' ? 'px-4 py-2 bg-black text-white' : 'px-4 py-2 border'
                "
                @click="currentTab = 'styles'"
              >
                {{ $t('Custom styles') }}
              </button>
              <button
                :class="
                  currentTab === 'qrcode' ? 'px-4 py-2 bg-black text-white' : 'px-4 py-2 border'
                "
                @click="currentTab = 'qrcode'"
              >
                {{ $t('QR-Code settings') }}
              </button>
              <button
                :class="
                  currentTab === 'mailtemplates'
                    ? 'px-4 py-2 bg-black text-white'
                    : 'px-4 py-2 border'
                "
                @click="currentTab = 'mailtemplates'"
              >
                {{ $t('Mail Templates') }}
              </button>
            </div>

            <GeneralSettings
              v-show="currentTab === 'general'"
              ref="generalRef"
              :updated-settings="updatedSettings"
              :items="items"
              :url="url"
              @open-qrcode="currentTab = 'qrcode'"
              @saved="showToast('success', $event)"
              @error="showToast('error', $event)"
            />
            <StylesSettings
              v-show="currentTab === 'styles'"
              ref="stylesRef"
              :styles="styles"
              @saved="showToast('success', $event)"
              @error="showToast('error', $event)"
            />
          </div>
        </div>

        <QrCodeSettings
          v-show="currentTab === 'qrcode'"
          inline
          @update="updateQRCodeSettings"
          @save-settings="saveGeneralFromParent()"
        />
        <MailTemplatesSettings
          v-show="currentTab === 'mailtemplates'"
          @saved="showToast('success', $event)"
          @error="showToast('error', $event)"
        />
        <Toast v-if="toast" :toast="toast" @close="toast = null" />
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
#styles {
  min-height: 300px;
}
</style>
