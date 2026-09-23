<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore, type Settings } from '@/stores/settings'
import Card from '@/components/ui/Card.vue'
import FormField from '@/components/ui/FormField.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  updatedSettings: Settings
  items: { ID: number; Name: string }[]
  url: string
}>()

const emits = defineEmits(['open-qrcode', 'saved', 'error'])

const settingsStore = useSettingsStore()

const localSettings = ref<Settings>({ ...props.updatedSettings })

const wpInviteEnabled = ref(!!props.updatedSettings.WordPressInviteURL)

const newLogo = ref('')
const newFavicon = ref('')
const newQrCodeLogo = ref('')

watch(
  () => props.updatedSettings,
  (val) => {
    if (val) localSettings.value = { ...val }
  },
  { deep: true }
)

const updateLogo = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  localSettings.value.Logo = file as File
  newLogo.value = URL.createObjectURL(file)
}

const updateFavicon = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  localSettings.value.Favicon = file as File
  newFavicon.value = URL.createObjectURL(file)
}

const updateQRCodeLogo = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  localSettings.value.QRCodeLogoImgUrl = file as unknown as string
  newQrCodeLogo.value = URL.createObjectURL(file)
}

const saveSettings = async () => {
  try {
    await settingsStore.updateSettings(localSettings.value as Settings)
    emits('saved', 'Einstellungen erfolgreich aktualisiert')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving settings in GeneralSettings:', err)
    emits('error', 'Einstellungen konnten nicht aktualisiert werden')
  }
}

defineExpose({ saveSettings })
</script>

<template>
  <div>
    <!-- Branding -->
    <Card class="section">
      <h2 class="section-title">{{ $t('Branding') }}</h2>
      <div class="field-grid">
        <FormField :label="$t('Newspaper name')" class="field-span-2" required>
          <input v-model="localSettings.NewspaperName" type="text" class="aug-input" required />
        </FormField>
        <FormField :label="$t('color')" required>
          <input v-model="localSettings.Color" type="text" class="aug-input" required />
        </FormField>
        <FormField :label="$t('fontColor')" required>
          <input v-model="localSettings.FontColor" type="text" class="aug-input" required />
        </FormField>
        <FormField label="Logo">
          <img
            v-if="typeof localSettings.Logo === 'string' || !localSettings.Logo"
            :src="
              localSettings.Logo
                ? props.url.replace(/\/$/, '') + localSettings.Logo
                : props.url + 'img/logo.png'
            "
            alt="Logo"
            class="preview-image"
          />
          <img v-else :src="newLogo" alt="Logo preview" class="preview-image" />
          <input type="file" accept="image/png" class="aug-input" @change="updateLogo" />
        </FormField>
        <FormField label="Favicon">
          <img
            v-if="typeof localSettings.Favicon === 'string' || !localSettings.Favicon"
            :src="
              localSettings.Favicon
                ? props.url + localSettings.Favicon.slice(1)
                : props.url + 'img/favicon.png'
            "
            alt="Favicon"
            class="preview-image"
          />
          <img v-else :src="newFavicon" alt="Favicon preview" class="preview-image" />
          <input type="file" accept="image/png" class="aug-input" @change="updateFavicon" />
        </FormField>
      </div>
    </Card>

    <!-- Webshop -->
    <Card class="section">
      <h2 class="section-title">{{ $t('Webshop') }}</h2>
      <div class="field-grid">
        <FormField :label="$t('mainProduct')" required>
          <select v-model="localSettings.MainItem" class="aug-input" required>
            <option v-for="item in props.items" :key="item.ID" :value="item.ID">
              {{ item.Name }}
            </option>
          </select>
        </FormField>
        <FormField :label="$t('Max order amount')">
          <input v-model.number="localSettings.MaxOrderAmount" type="number" class="aug-input" />
        </FormField>
      </div>
      <div class="toggle-grid">
        <label class="aug-toggle">
          <input v-model="localSettings.WebshopIsClosed" type="checkbox" />
          <span class="aug-toggle-track"></span>
          <span>{{ $t('Webshop closed') }}</span>
        </label>
        <label class="aug-toggle">
          <input v-model="localSettings.ShopLanding" type="checkbox" />
          <span class="aug-toggle-track"></span>
          <span>{{ $t('Shop page as landing page') }}</span>
        </label>
        <label class="aug-toggle">
          <input v-model="localSettings.UseTipInsteadOfDonation" type="checkbox" />
          <span class="aug-toggle-track"></span>
          <span>{{ $t('Use tip instead of donation in the shop') }}</span>
        </label>
        <label class="aug-toggle">
          <input v-model="localSettings.OrgaCoversTransactionCosts" type="checkbox" />
          <span class="aug-toggle-track"></span>
          <span>{{ $t('Orga covers transaction costs') }}</span>
        </label>
        <label class="aug-toggle">
          <input v-model="localSettings.UseVendorLicenseIdInShop" type="checkbox" />
          <span class="aug-toggle-track"></span>
          <span>{{ $t('Use the license id instead of the name in the shop') }}</span>
        </label>
      </div>
    </Card>

    <!-- Point of Sale -->
    <Card class="section">
      <h2 class="section-title">{{ $t('menuPOS') }}</h2>
      <label class="aug-toggle">
        <input v-model="localSettings.POSEnabled" type="checkbox" />
        <span class="aug-toggle-track"></span>
        <span>{{ $t('settingsPOSEnabled') }}</span>
      </label>
    </Card>

    <!-- Abonement / Subscription -->
    <Card class="section">
      <h2 class="section-title">{{ $t('abonementModule') }}</h2>
      <label class="aug-toggle toggle-spaced">
        <input v-model="localSettings.AbonementEnabled" type="checkbox" />
        <span class="aug-toggle-track"></span>
        <span>{{ $t('abonementModuleEnabled') }}</span>
      </label>
      <FormField
        v-if="localSettings.AbonementEnabled"
        :label="$t('Abonement URL')"
        class="field-mt"
      >
        <input v-model="localSettings.AbonementUrl" type="url" class="aug-input" />
      </FormField>
    </Card>

    <!-- URLs -->
    <Card class="section">
      <h2 class="section-title">URLs</h2>
      <div class="field-grid">
        <FormField :label="$t('AGB URL')">
          <div class="input-with-action">
            <input v-model="localSettings.AGBUrl" type="text" class="aug-input" />
            <Button variant="secondary" @click="settingsStore.toAGB()">{{ $t('Open') }}</Button>
          </div>
        </FormField>
        <FormField :label="$t('privacyPolicyUrl')" :hint="$t('privacyPolicyUrlHint')">
          <div class="input-with-action">
            <input v-model="localSettings.PrivacyPolicyUrl" type="text" class="aug-input" />
            <Button
              variant="secondary"
              :disabled="!localSettings.PrivacyPolicyUrl"
              @click="settingsStore.toPrivacyPolicy()"
            >
              {{ $t('Open') }}
            </Button>
          </div>
        </FormField>
        <FormField :label="$t('Maintainance mode help URL')">
          <input v-model="localSettings.MaintainanceModeHelpUrl" type="text" class="aug-input" />
        </FormField>
        <FormField :label="$t('onlinePaperUrl')" :hint="$t('onlinePaperUrlHint')">
          <input v-model="localSettings.OnlinePaperUrl" type="text" class="aug-input" />
        </FormField>
        <FormField :label="$t('Vendor email postfix')">
          <input v-model="localSettings.VendorEmailPostfix" type="text" class="aug-input" />
        </FormField>
        <FormField :label="$t('Digital items URL')">
          <input v-model="localSettings.DigitalItemsUrl" type="text" class="aug-input" />
        </FormField>
      </div>
    </Card>

    <!-- WordPress one-time login -->
    <Card class="section">
      <h2 class="section-title">{{ $t('wpInviteTitle') }}</h2>
      <label class="aug-toggle toggle-spaced">
        <input v-model="wpInviteEnabled" type="checkbox" />
        <span class="aug-toggle-track"></span>
        <span>{{ $t('wpInviteEnabled') }}</span>
      </label>
      <div v-if="wpInviteEnabled" class="field-grid">
        <FormField :label="$t('wpInviteURL')" class="field-span-2">
          <input
            v-model="localSettings.WordPressInviteURL"
            type="url"
            class="aug-input"
            placeholder="http://host.docker.internal:8088/wp-json/augustin/v1/shop/create-invite"
          />
        </FormField>
        <FormField :label="$t('wpInviteAPIKey')">
          <input
            v-model="localSettings.WordPressInviteAPIKey"
            type="password"
            autocomplete="new-password"
            class="aug-input"
          />
        </FormField>
        <FormField :label="$t('wpInviteTTL')">
          <input
            v-model.number="localSettings.WordPressInviteTTL"
            type="number"
            min="3600"
            class="aug-input"
          />
        </FormField>
      </div>
    </Card>

    <!-- Matomo -->
    <Card class="section">
      <h2 class="section-title">{{ $t('matomoTitle') }}</h2>
      <p class="section-hint">{{ $t('matomoHint') }}</p>
      <div class="field-grid">
        <FormField :label="$t('matomoUrl')">
          <input
            v-model="localSettings.MatomoUrl"
            type="url"
            class="aug-input"
            placeholder="https://matomo.example.org/"
          />
        </FormField>
        <FormField :label="$t('matomoSiteId')">
          <input
            v-model="localSettings.MatomoSiteId"
            type="text"
            inputmode="numeric"
            class="aug-input"
            placeholder="1"
          />
        </FormField>
      </div>
    </Card>

    <!-- Map -->
    <Card class="section">
      <h2 class="section-title">{{ $t('menuMap') }}</h2>
      <div class="field-grid">
        <FormField :label="$t('Map center lat')">
          <input
            v-model.number="localSettings.MapCenterLat"
            type="number"
            step="0.000001"
            class="aug-input"
          />
        </FormField>
        <FormField :label="$t('Map center long')">
          <input
            v-model.number="localSettings.MapCenterLong"
            type="number"
            step="0.000001"
            class="aug-input"
          />
        </FormField>
      </div>
    </Card>

    <!-- QR Code -->
    <Card class="section">
      <h2 class="section-title">{{ $t('QR-Code settings') }}</h2>
      <div class="field-grid">
        <FormField :label="$t('QR Code url')" required>
          <input v-model="localSettings.QRCodeUrl" type="text" class="aug-input" required />
        </FormField>
        <div class="toggle-inline">
          <label class="aug-toggle">
            <input v-model="localSettings.QRCodeEnableLogo" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('Show QR code logo') }}</span>
          </label>
        </div>
        <FormField :label="$t('QR Code logo')">
          <img
            v-if="
              typeof localSettings.QRCodeLogoImgUrl === 'string' || !localSettings.QRCodeLogoImgUrl
            "
            :src="
              localSettings.QRCodeLogoImgUrl
                ? props.url + localSettings.QRCodeLogoImgUrl
                : props.url + 'img/qrcode.png'
            "
            alt="QR code logo"
            class="preview-image"
          />
          <img v-else :src="newQrCodeLogo" alt="QR code logo preview" class="preview-image" />
          <input type="file" accept="image/png" class="aug-input" @change="updateQRCodeLogo" />
        </FormField>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.section-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.field-span-2 {
  grid-column: span 2;
}
.field-mt {
  margin-top: 14px;
}
.toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-top: 16px;
}
.toggle-spaced {
  margin-bottom: 14px;
}
.toggle-inline {
  display: flex;
  align-items: flex-end;
}
.input-with-action {
  display: flex;
  gap: 8px;
}
.input-with-action .aug-input {
  flex: 1;
}
.preview-image {
  display: block;
  height: 64px;
  object-fit: contain;
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .field-grid,
  .toggle-grid {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: span 1;
  }
}
</style>
