<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore, type Settings } from '@/stores/settings'
import Card from '@/components/ui/Card.vue'
import FormField from '@/components/ui/FormField.vue'
import Button from '@/components/ui/Button.vue'
import ModuleCard from '@/components/settings/ModuleCard.vue'
import {
  testNextcloud,
  testWordPressInvite,
  type NextcloudTestResult,
  type WordPressInviteTestResult
} from '@/api/api'
import {
  faCashRegister,
  faChartLine,
  faCloud,
  faCommentDots,
  faEnvelopeOpenText,
  faHandHoldingHeart,
  faIdCard,
  faArrowRightArrowLeft,
  faRepeat,
  faRightToBracket
} from '@fortawesome/free-solid-svg-icons'
import { internalVendorEmail, normalizeVendorEmailPostfix } from '@/utils/vendorEmail'

const props = defineProps<{
  updatedSettings: Settings
  items: { ID: number; Name: string }[]
  url: string
  section: 'general' | 'modules' | 'qrcode'
  // False until the complete admin settings are loaded; saving before would lose values
  canSave: boolean
}>()

const emits = defineEmits(['open-qrcode', 'saved', 'error'])

const settingsStore = useSettingsStore()
const { t } = useI18n()

const localSettings = ref<Settings>({ ...props.updatedSettings })

// These integrations have no switch of their own in the backend: an empty URL means off.
const wpInviteEnabled = ref(!!props.updatedSettings.WordPressInviteURL)
const matomoEnabled = ref(!!props.updatedSettings.MatomoUrl)
const odooEnabled = ref(!!props.updatedSettings.OdooWebhookURL)

const wpInviteTesting = ref(false)
const wpInviteTestResult = ref<WordPressInviteTestResult | null>(null)

// Tests the values in the form, so a typo shows up before saving
const testWpInvite = async () => {
  wpInviteTesting.value = true
  wpInviteTestResult.value = null

  try {
    const res = await testWordPressInvite(
      localSettings.value.WordPressInviteURL,
      localSettings.value.WordPressInviteAPIKey
    )

    wpInviteTestResult.value = res.data
  } catch (err) {
    wpInviteTestResult.value = { Success: false, Message: String(err), Link: '' }
  } finally {
    wpInviteTesting.value = false
  }
}

// Secrets never come back from the backend; an empty field keeps the stored value
const secretPlaceholder = (key: string) =>
  settingsStore.settings.SecretsSet?.[key] ? t('secretStored') : t('secretNotSet')

const nextcloudTesting = ref(false)
const nextcloudTestResult = ref<NextcloudTestResult | null>(null)

// The backend only tests the saved settings, so the form is saved first
const testNextcloudConnection = async () => {
  nextcloudTesting.value = true
  nextcloudTestResult.value = null

  try {
    if (!(await saveSettings())) return
    const res = await testNextcloud()
    nextcloudTestResult.value = res.data
  } catch (err) {
    nextcloudTestResult.value = { Success: false, Message: String(err) }
  } finally {
    nextcloudTesting.value = false
  }
}

// Vendors without an own email get "<license ID><postfix>", so it has to make a valid address
const vendorEmailPostfixError = computed(() =>
  normalizeVendorEmailPostfix(localSettings.value.VendorEmailPostfix) === null
    ? t('vendorEmailPostfixInvalid')
    : ''
)

const vendorEmailPostfixHint = computed(() =>
  t('vendorEmailPostfixHint', {
    example: internalVendorEmail('123', localSettings.value.VendorEmailPostfix)
  })
)

const newLogo = ref('')
const newFavicon = ref('')
const newQrCodeLogo = ref('')

watch(
  () => props.updatedSettings,
  (val) => {
    if (!val) return
    localSettings.value = { ...val }
    // The settings arrive after mount, so the toggle has to follow them rather than only
    // reading the (still empty) initial props.
    wpInviteEnabled.value = !!val.WordPressInviteURL
    matomoEnabled.value = !!val.MatomoUrl
    odooEnabled.value = !!val.OdooWebhookURL
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

const saveSettings = async (): Promise<boolean> => {
  // The backend treats an empty URL as "disabled", so switching the toggle off has to clear it.
  if (!wpInviteEnabled.value) localSettings.value.WordPressInviteURL = ''
  if (!matomoEnabled.value) localSettings.value.MatomoUrl = ''
  if (!odooEnabled.value) localSettings.value.OdooWebhookURL = ''

  if (vendorEmailPostfixError.value) {
    emits('error', vendorEmailPostfixError.value)
    return false
  }

  try {
    await settingsStore.updateSettings(localSettings.value as Settings)
    emits('saved', 'Einstellungen erfolgreich aktualisiert')
    return true
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving settings in GeneralSettings:', err)
    emits('error', 'Einstellungen konnten nicht aktualisiert werden')
    return false
  }
}

defineExpose({ saveSettings })
</script>

<template>
  <div>
    <template v-if="props.section === 'general'">
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
            <input v-model="localSettings.DonationPageEnabled" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('settingsDonationPageEnabled') }}</span>
          </label>
          <label class="aug-toggle">
            <input v-model="localSettings.AGBRequired" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('settingsAGBRequired') }}</span>
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
          <FormField
            :label="$t('Vendor email postfix')"
            :error="vendorEmailPostfixError"
            :hint="vendorEmailPostfixHint"
          >
            <input v-model="localSettings.VendorEmailPostfix" type="text" class="aug-input" />
          </FormField>
          <FormField :label="$t('Digital items URL')">
            <input v-model="localSettings.DigitalItemsUrl" type="text" class="aug-input" />
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
    </template>

    <template v-else-if="props.section === 'modules'">
      <h2 class="module-group-title">{{ $t('moduleGroupFeatures') }}</h2>
      <div class="module-list">
        <ModuleCard
          v-model="localSettings.POSEnabled"
          :icon="faCashRegister"
          :title="$t('menuPOS')"
          :description="$t('modulePOSHint')"
        />
        <ModuleCard
          v-model="localSettings.IDScanEnabled"
          :icon="faIdCard"
          :title="$t('idScanTitle')"
          :description="$t('settingsIdScanHint')"
        />
        <ModuleCard
          v-model="localSettings.AbonementEnabled"
          :icon="faRepeat"
          :title="$t('abonementModule')"
          :description="$t('moduleAbonementHint')"
        >
          <FormField :label="$t('Abonement URL')">
            <input v-model="localSettings.AbonementUrl" type="url" class="aug-input" />
          </FormField>
        </ModuleCard>
        <ModuleCard
          v-model="localSettings.DonationTrackingEnabled"
          :icon="faHandHoldingHeart"
          :title="$t('donationTrackingTitle')"
          :description="$t('settingsDonationTrackingHint')"
        />
        <ModuleCard
          v-model="localSettings.FeedbackEnabled"
          :icon="faCommentDots"
          :title="$t('feedbackSettingsTitle')"
          :description="$t('feedbackSettingsHint')"
        >
          <FormField :label="$t('feedbackSettingsEmail')">
            <input
              v-model="localSettings.FeedbackEmail"
              type="email"
              class="aug-input"
              placeholder="feedback@example.org"
            />
          </FormField>
        </ModuleCard>
        <ModuleCard
          v-model="localSettings.NewsletterEnabled"
          :icon="faEnvelopeOpenText"
          :title="$t('newsletter')"
          :description="$t('newsletterSettingsHint')"
        />
      </div>

      <h2 class="module-group-title">{{ $t('moduleGroupIntegrations') }}</h2>
      <div class="module-list">
        <ModuleCard
          v-model="localSettings.NextcloudEnabled"
          :icon="faCloud"
          :title="$t('nextcloudTitle')"
          :description="$t('settingsNextcloudHint')"
        >
          <div class="field-grid">
            <FormField :label="$t('nextcloudUrl')" :hint="$t('nextcloudUrlHint')">
              <input
                v-model="localSettings.NextcloudURL"
                type="url"
                class="aug-input"
                placeholder="https://cloud.example.org"
              />
            </FormField>
            <FormField :label="$t('nextcloudPublicUrl')" :hint="$t('nextcloudPublicUrlHint')">
              <input
                v-model="localSettings.NextcloudPublicURL"
                type="url"
                class="aug-input"
                :placeholder="localSettings.NextcloudURL || 'https://cloud.example.org'"
              />
            </FormField>
            <FormField :label="$t('nextcloudUsername')">
              <input
                v-model="localSettings.NextcloudUsername"
                type="text"
                autocomplete="off"
                class="aug-input"
              />
            </FormField>
            <FormField :label="$t('nextcloudAppPassword')" :hint="$t('nextcloudAppPasswordHint')">
              <input
                v-model="localSettings.NextcloudAppPassword"
                type="password"
                autocomplete="new-password"
                class="aug-input"
                :placeholder="secretPlaceholder('NextcloudAppPassword')"
              />
            </FormField>
            <FormField
              :label="$t('nextcloudVendorRoot')"
              :hint="$t('nextcloudVendorRootHint')"
              class="field-span-2"
            >
              <input v-model="localSettings.NextcloudVendorRoot" type="text" class="aug-input" />
            </FormField>
            <div class="field-span-2 connection-test">
              <Button
                variant="secondary"
                :disabled="nextcloudTesting || !props.canSave"
                @click="testNextcloudConnection"
              >
                {{ nextcloudTesting ? $t('wpInviteTesting') : $t('nextcloudSaveAndTest') }}
              </Button>
              <p
                v-if="nextcloudTestResult"
                class="connection-test-result"
                :class="nextcloudTestResult.Success ? 'is-success' : 'is-error'"
              >
                {{ nextcloudTestResult.Success ? '✓' : '✗' }} {{ nextcloudTestResult.Message }}
              </p>
            </div>
          </div>
        </ModuleCard>
        <ModuleCard
          v-model="wpInviteEnabled"
          :icon="faRightToBracket"
          :title="$t('wpInviteTitle')"
          :description="$t('moduleWordPressHint')"
        >
          <div class="field-grid">
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
                :placeholder="secretPlaceholder('WordPressInviteAPIKey')"
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
            <div class="field-span-2 wp-invite-test">
              <Button variant="secondary" :disabled="wpInviteTesting" @click="testWpInvite">
                {{ wpInviteTesting ? $t('wpInviteTesting') : $t('wpInviteTest') }}
              </Button>
              <p
                v-if="wpInviteTestResult"
                class="wp-invite-test-result"
                :class="wpInviteTestResult.Success ? 'is-success' : 'is-error'"
              >
                {{ wpInviteTestResult.Success ? '✓' : '✗' }} {{ wpInviteTestResult.Message }}
                <span v-if="wpInviteTestResult.Link" class="wp-invite-test-link">
                  {{ $t('wpInviteTestLink') }} {{ wpInviteTestResult.Link }}
                </span>
              </p>
            </div>
          </div>
        </ModuleCard>
        <ModuleCard
          v-model="matomoEnabled"
          :icon="faChartLine"
          :title="$t('matomoTitle')"
          :description="$t('matomoHint')"
        >
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
          <label class="aug-toggle field-mt">
            <input v-model="localSettings.MatomoTrackCart" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('matomoTrackCart') }}</span>
          </label>
        </ModuleCard>
        <ModuleCard
          v-model="odooEnabled"
          :icon="faArrowRightArrowLeft"
          :title="$t('odooTitle')"
          :description="$t('odooHint')"
        >
          <div class="field-grid">
            <FormField :label="$t('odooWebhookUrl')" class="field-span-2">
              <input
                v-model="localSettings.OdooWebhookURL"
                type="url"
                class="aug-input"
                placeholder="https://odoo.example.org/augustin/webhook"
              />
            </FormField>
            <FormField :label="$t('odooDBFilter')" :hint="$t('odooDBFilterHint')">
              <input
                v-model="localSettings.OdooDBFilter"
                type="text"
                class="aug-input"
                placeholder="augustin"
              />
            </FormField>
            <FormField :label="$t('odooWebhookToken')" :hint="$t('odooWebhookTokenHint')">
              <input
                v-model="localSettings.OdooWebhookToken"
                type="password"
                autocomplete="new-password"
                class="aug-input"
                :placeholder="secretPlaceholder('OdooWebhookToken')"
              />
            </FormField>
          </div>
        </ModuleCard>
      </div>
    </template>

    <template v-else-if="props.section === 'qrcode'">
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
                typeof localSettings.QRCodeLogoImgUrl === 'string' ||
                !localSettings.QRCodeLogoImgUrl
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
    </template>
  </div>
</template>

<style scoped>
.section {
  margin-bottom: 20px;
}
.module-group-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin: 4px 0 12px;
}
.module-list {
  display: grid;
  gap: 12px;
  margin-bottom: 28px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.connection-test,
.wp-invite-test {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.connection-test-result,
.wp-invite-test-result {
  font-size: 13px;
  margin: 0;
  overflow-wrap: anywhere;
}
.connection-test-result.is-success,
.wp-invite-test-result.is-success {
  color: var(--color-success);
}
.connection-test-result.is-error,
.wp-invite-test-result.is-error {
  color: var(--color-danger);
}
.wp-invite-test-link {
  display: block;
  color: var(--color-text-muted);
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
