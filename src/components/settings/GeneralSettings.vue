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

// local copy of the prop to avoid mutating props directly
const localSettings = ref<Settings>({ ...props.updatedSettings })

const newLogo = ref('')
const newFavicon = ref('')
const newQrCodeLogo = ref('')

// keep local copy in sync when parent updates prop
watch(
  () => props.updatedSettings,
  (val) => {
    if (val) localSettings.value = { ...val }
  },
  { deep: true }
)

const updateLogo = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  localSettings.value.Logo = file as File
  newLogo.value = URL.createObjectURL(file)
}

const updateFavicon = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  localSettings.value.Favicon = file as File
  newFavicon.value = URL.createObjectURL(file)
}

const updateQRCodeLogo = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  // store file as a string-compatible value for the form; backend expects a file or url
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
  <div class="form">
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="newspapername"
        >{{ $t('Newspaper name') }}:</label
      >
      <div class="flex flex-row">
        <input
          id="newspapername"
          v-model="localSettings.NewspaperName"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          required
        />
      </div>
    </div>

    <!-- Logo -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="logo">Logo:</label>
      <div class="flex flex-col">
        <img
          v-if="(localSettings && typeof localSettings.Logo === 'string') || !localSettings?.Logo"
          :src="
            localSettings?.Logo && localSettings?.Logo !== ''
              ? props.url.replace(/\/$/, '') + localSettings.Logo
              : props.url + 'img/logo.png'
          "
          alt="Newspaper logo"
          class="logo my-5"
          width="200"
          height="auto"
        />
        <img
          v-else
          :src="newLogo"
          alt="Newspaper logo2"
          class="logo my-5"
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

    <!-- Favicon -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="favicon">Favicon:</label>
      <div class="flex flex-col">
        <img
          v-if="
            (localSettings && typeof localSettings.Favicon === 'string') || !localSettings?.Favicon
          "
          :src="
            localSettings?.Favicon && localSettings?.Favicon !== ''
              ? props.url + localSettings.Favicon.slice(1)
              : props.url + 'img/favicon.png'
          "
          alt="Newspaper favicon"
          class="favicon my-5"
          width="200"
          height="auto"
        />
        <img
          v-else
          :src="newFavicon"
          alt="Newspaper favicon2"
          class="favicon my-5"
          width="200"
          height="auto"
        />
        <input
          id="favicon"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="file"
          accept="image/png"
          @change="updateFavicon"
        />
      </div>
    </div>

    <!-- Colors and main item etc. -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color"
          >{{ $t('color') }}:</label
        >
        <div class="flex flex-row">
          <input
            id="color"
            v-model="localSettings.Color"
            class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            required
          />
        </div>
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color"
          >{{ $t('fontColor') }}:</label
        >
        <div class="flex flex-row">
          <input
            id="color"
            v-model="localSettings.FontColor"
            class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            required
          />
        </div>
      </div>
    </div>
    <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mainItem"
      >{{ $t('mainProduct') }}:</label
    >
    <div class="flex flex-row">
      <select
        id="mainItem"
        v-model="localSettings.MainItem"
        class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      >
        <option v-for="item in props.items" :key="item.ID" :value="item.ID">{{ item.Name }}</option>
      </select>
    </div>
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="maxOrder"
        >{{ $t('Max order amount') }}:</label
      >
      <input
        id="maxOrder"
        v-model.number="localSettings.MaxOrderAmount"
        type="number"
        class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
      />
    </div>
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Webshop closed') }}:</label
        >
        <input v-model="localSettings.WebshopIsClosed" type="checkbox" class="ml-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Orga covers transaction costs') }}:</label
        >
        <input v-model="localSettings.OrgaCoversTransactionCosts" type="checkbox" class="ml-2" />
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="agb"
          >{{ $t('AGB URL') }}:</label
        >
        <div class="flex gap-2">
          <input
            id="agb"
            v-model="localSettings.AGBUrl"
            class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
            type="text"
          />
          <button type="button" class="px-3 rounded bg-gray-200" @click="settingsStore.toAGB()">
            {{ $t('Open') }}
          </button>
        </div>
      </div>
      <div class="">
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="maintainance"
          >{{ $t('Maintainance mode help URL') }}:</label
        >
        <input
          id="maintainance"
          v-model="localSettings.MaintainanceModeHelpUrl"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
          type="text"
        />
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorpostfix"
          >{{ $t('Vendor email postfix') }}:</label
        >
        <input
          id="vendorpostfix"
          v-model="localSettings.VendorEmailPostfix"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
          type="text"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="digitalUrl"
          >{{ $t('Digital items URL') }}:</label
        >
        <input
          id="digitalUrl"
          v-model="localSettings.DigitalItemsUrl"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
          type="text"
        />
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Map center lat') }}:</label
        >
        <input
          v-model.number="localSettings.MapCenterLat"
          type="number"
          step="0.000001"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Map center long') }}:</label
        >
        <input
          v-model.number="localSettings.MapCenterLong"
          type="number"
          step="0.000001"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Use the license id instead of the name in the shop') }}:</label
        >
        <input v-model="localSettings.UseVendorLicenseIdInShop" type="checkbox" class="ml-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Show QR code logo') }}:</label
        >
        <input v-model="localSettings.QRCodeEnableLogo" type="checkbox" class="ml-2" />
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Use tip instead of donation in the shop') }}:</label
        >
        <input v-model="localSettings.UseTipInsteadOfDonation" type="checkbox" class="ml-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2 pt-3"
          >{{ $t('Shop page as landing page') }}:</label
        >
        <input v-model="localSettings.ShopLanding" type="checkbox" class="ml-2" />
      </div>
    </div>

    <!-- QR code logo -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcodelogo"
        >{{ $t('QR Code logo') }}:</label
      >
      <div class="flex flex-col">
        <img
          v-if="
            (localSettings && typeof localSettings.QRCodeLogoImgUrl === 'string') ||
            !localSettings?.QRCodeLogoImgUrl
          "
          :src="
            localSettings?.QRCodeLogoImgUrl && localSettings?.QRCodeLogoImgUrl !== ''
              ? props.url + localSettings.QRCodeLogoImgUrl
              : props.url + 'img/qrcode.png'
          "
          alt="QR code logo"
          class="favicon my-5"
          width="200"
          height="auto"
        />
        <img
          v-else
          :src="newQrCodeLogo"
          alt="QR code logo2"
          class="favicon my-5"
          width="200"
          height="auto"
        />
        <input
          id="qrcodelogo"
          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="file"
          accept="image/png"
          @change="updateQRCodeLogo"
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
          v-model="localSettings.QRCodeUrl"
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
        class="px-4 py-2 ps-2 mt-2 rounded-full customcolor h-[44px]"
        @click="saveSettings()"
      >
        {{ $t('save') }}
      </button>
    </div>
  </div>
</template>
