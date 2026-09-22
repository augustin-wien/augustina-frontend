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
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'

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
  OdooEnabled: false,
  WordPressInviteURL: '',
  WordPressInviteAPIKey: '',
  WordPressInviteTTL: 604800,
  PrivacyPolicyUrl: '',
  MatomoUrl: '',
  MatomoSiteId: '',
  OnlinePaperUrl: ''
})

// The public settings endpoint withholds credentials, so this page loads the full set from the
// admin route. Until that arrived, saving is blocked: patchSettings posts every field back, so
// saving a half-loaded form would overwrite the withheld credentials with empty strings.
const adminSettingsLoaded = ref(false)

useAuthLoad(async () => {
  storeItems.getItems()
  settingsStore.getStyleCss()

  adminSettingsLoaded.value = await settingsStore.getAdminSettingsFromApi()
  updatedSettings.value = settingsStore.settings

  if (!adminSettingsLoaded.value) {
    showToast('error', 'Einstellungen konnten nicht vollständig geladen werden')
  }
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

const saveCurrentTab = () => {
  if (currentTab.value === 'general' || currentTab.value === 'qrcode') {
    saveGeneralFromParent()
  } else if (currentTab.value === 'styles') {
    const comp = stylesRef.value
    if (comp && comp.saveStyles) comp.saveStyles()
  }
  // mailtemplates: save is per-template inside the editor
}

// UI tab for settings page: 'general', 'styles' or 'qrcode'
const currentTab = ref<'general' | 'styles' | 'qrcode' | 'mailtemplates'>('general')
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuSettings')" />
    </template>
    <template #main>
      <!-- min-h-full, not h-full: the tab content has to be allowed to grow past one screen,
           otherwise it overflows a box locked to the viewport height and the sticky save bar
           below ends up sitting in the middle of the content instead of at the bottom. -->
      <div v-if="settingsStore.settings" class="min-h-full flex flex-col">
        <!-- Tab nav -->
        <div class="tab-nav">
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'general' }"
            @click="currentTab = 'general'"
          >
            {{ $t('General') }}
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'styles' }"
            @click="currentTab = 'styles'"
          >
            {{ $t('Custom styles') }}
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'qrcode' }"
            @click="currentTab = 'qrcode'"
          >
            {{ $t('QR-Code settings') }}
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn-active': currentTab === 'mailtemplates' }"
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

      <!-- Sticky save footer (hidden on mail templates tab since save is per-template) -->
      <div v-if="currentTab !== 'mailtemplates'" class="save-footer">
        <Button variant="primary" :disabled="!adminSettingsLoaded" @click="saveCurrentTab()">
          {{ $t('save') }}
        </Button>
      </div>
    </template>
  </component>
</template>

<style scoped>
.tab-nav {
  flex: none;
  margin-bottom: 20px;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
}
.tab-btn {
  margin-bottom: -1px;
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
}
.tab-btn:hover {
  color: var(--color-text);
}
.tab-btn-active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
.save-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}
</style>
