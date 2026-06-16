<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore, type Settings } from '@/stores/settings'
import { computed, ref, watch } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import QrCodeSettings from '@/components/QrCodeSettings.vue'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import StylesSettings from '@/components/settings/StylesSettings.vue'
import MailTemplatesSettings from '@/components/settings/MailTemplatesSettings.vue'

const settingsStore = useSettingsStore()
const storeItems = useItemsStore()

const settings = computed(() => settingsStore.settings)
const items = computed(() => storeItems.items)

const styles = ref('')
styles.value = settingsStore.styles

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
  DigitalItemsUrl: '',
  AbonementUrl: '',
  AbonementEnabled: false,
  POSEnabled: true,
  WordPressInviteURL: '',
  WordPressInviteAPIKey: '',
  WordPressInviteTTL: 604800
})

useAuthLoad(() => {
  storeItems.getItems()
  settingsStore.getSettingsFromApi()
  updatedSettings.value = settingsStore.settings
  settingsStore.getStyleCss()
})

watch(settings, (newVal) => {
  if (newVal) {
    updatedSettings.value = newVal
  }
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
      <div v-if="settingsStore.settings" class="max-w-4xl">
        <!-- Tab nav -->
        <div class="mb-6 flex gap-2 border-b pb-2">
          <button
            :class="
              currentTab === 'general'
                ? 'px-4 py-2 bg-black text-white rounded-t'
                : 'px-4 py-2 border rounded-t'
            "
            @click="currentTab = 'general'"
          >
            {{ $t('General') }}
          </button>
          <button
            :class="
              currentTab === 'styles'
                ? 'px-4 py-2 bg-black text-white rounded-t'
                : 'px-4 py-2 border rounded-t'
            "
            @click="currentTab = 'styles'"
          >
            {{ $t('Custom styles') }}
          </button>
          <button
            :class="
              currentTab === 'qrcode'
                ? 'px-4 py-2 bg-black text-white rounded-t'
                : 'px-4 py-2 border rounded-t'
            "
            @click="currentTab = 'qrcode'"
          >
            {{ $t('QR-Code settings') }}
          </button>
          <button
            :class="
              currentTab === 'mailtemplates'
                ? 'px-4 py-2 bg-black text-white rounded-t'
                : 'px-4 py-2 border rounded-t'
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
