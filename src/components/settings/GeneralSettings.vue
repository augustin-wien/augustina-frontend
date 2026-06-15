<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore, type Settings } from '@/stores/settings'

const props = defineProps<{
  updatedSettings: Settings
  items: { ID: number; Name: string }[]
  url: string
}>()

const emits = defineEmits(['open-qrcode', 'saved', 'error'])

const settingsStore = useSettingsStore()

const localSettings = ref<Settings>({ ...props.updatedSettings })

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
  <div class="space-y-6">
    <!-- Branding -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('Branding') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Newspaper name -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Newspaper name')
          }}</label>
          <input
            v-model="localSettings.NewspaperName"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
            required
          />
        </div>
        <!-- Color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('color') }}</label>
          <input
            v-model="localSettings.Color"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
            required
          />
        </div>
        <!-- Font color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('fontColor') }}</label>
          <input
            v-model="localSettings.FontColor"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
            required
          />
        </div>
        <!-- Logo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          <img
            v-if="typeof localSettings.Logo === 'string' || !localSettings.Logo"
            :src="
              localSettings.Logo
                ? props.url.replace(/\/$/, '') + localSettings.Logo
                : props.url + 'img/logo.png'
            "
            alt="Logo"
            class="mb-2 h-16 object-contain"
          />
          <img v-else :src="newLogo" alt="Logo preview" class="mb-2 h-16 object-contain" />
          <input
            type="file"
            accept="image/png"
            class="w-full border rounded px-3 py-1 text-sm text-gray-700"
            @change="updateLogo"
          />
        </div>
        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
          <img
            v-if="typeof localSettings.Favicon === 'string' || !localSettings.Favicon"
            :src="
              localSettings.Favicon
                ? props.url + localSettings.Favicon.slice(1)
                : props.url + 'img/favicon.png'
            "
            alt="Favicon"
            class="mb-2 h-16 object-contain"
          />
          <img v-else :src="newFavicon" alt="Favicon preview" class="mb-2 h-16 object-contain" />
          <input
            type="file"
            accept="image/png"
            class="w-full border rounded px-3 py-1 text-sm text-gray-700"
            @change="updateFavicon"
          />
        </div>
      </div>
    </div>

    <!-- Webshop -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('Webshop') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('mainProduct')
          }}</label>
          <select
            v-model="localSettings.MainItem"
            class="w-full border rounded px-3 py-2 text-gray-700"
            required
          >
            <option v-for="item in props.items" :key="item.ID" :value="item.ID">
              {{ item.Name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Max order amount')
          }}</label>
          <input
            v-model.number="localSettings.MaxOrderAmount"
            type="number"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="localSettings.WebshopIsClosed" type="checkbox" />
          {{ $t('Webshop closed') }}
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="localSettings.ShopLanding" type="checkbox" />
          {{ $t('Shop page as landing page') }}
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="localSettings.UseTipInsteadOfDonation" type="checkbox" />
          {{ $t('Use tip instead of donation in the shop') }}
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="localSettings.OrgaCoversTransactionCosts" type="checkbox" />
          {{ $t('Orga covers transaction costs') }}
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="localSettings.UseVendorLicenseIdInShop" type="checkbox" />
          {{ $t('Use the license id instead of the name in the shop') }}
        </label>
      </div>
    </div>

    <!-- Point of Sale -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('menuPOS') }}</h2>
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input v-model="localSettings.POSEnabled" type="checkbox" />
        {{ $t('settingsPOSEnabled') }}
      </label>
    </div>

    <!-- URLs -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">URLs</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('AGB URL') }}</label>
          <div class="flex gap-2">
            <input
              v-model="localSettings.AGBUrl"
              type="text"
              class="flex-1 border rounded px-3 py-2 text-gray-700"
            />
            <button
              type="button"
              class="px-3 rounded bg-gray-100 border text-sm"
              @click="settingsStore.toAGB()"
            >
              {{ $t('Open') }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Maintainance mode help URL')
          }}</label>
          <input
            v-model="localSettings.MaintainanceModeHelpUrl"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Vendor email postfix')
          }}</label>
          <input
            v-model="localSettings.VendorEmailPostfix"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Digital items URL')
          }}</label>
          <input
            v-model="localSettings.DigitalItemsUrl"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Abonement URL')
          }}</label>
          <input
            v-model="localSettings.AbonementUrl"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
      </div>
    </div>

    <!-- Map -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('menuMap') }}</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Map center lat')
          }}</label>
          <input
            v-model.number="localSettings.MapCenterLat"
            type="number"
            step="0.000001"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('Map center long')
          }}</label>
          <input
            v-model.number="localSettings.MapCenterLong"
            type="number"
            step="0.000001"
            class="w-full border rounded px-3 py-2 text-gray-700"
          />
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('QR-Code settings') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('QR Code url')
          }}</label>
          <input
            v-model="localSettings.QRCodeUrl"
            type="text"
            class="w-full border rounded px-3 py-2 text-gray-700"
            required
          />
        </div>
        <div class="flex items-end">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="localSettings.QRCodeEnableLogo" type="checkbox" />
            {{ $t('Show QR code logo') }}
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('QR Code logo')
          }}</label>
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
            class="mb-2 h-16 object-contain"
          />
          <img
            v-else
            :src="newQrCodeLogo"
            alt="QR code logo preview"
            class="mb-2 h-16 object-contain"
          />
          <input
            type="file"
            accept="image/png"
            class="w-full border rounded px-3 py-1 text-sm text-gray-700"
            @change="updateQRCodeLogo"
          />
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end">
      <button
        type="submit"
        class="px-6 py-2 rounded-full customcolor font-semibold"
        @click="saveSettings()"
      >
        {{ $t('save') }}
      </button>
    </div>
  </div>
</template>
