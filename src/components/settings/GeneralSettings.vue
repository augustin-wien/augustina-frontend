<script setup lang="ts">

import { ref, defineProps, defineEmits, defineExpose } from 'vue'
import { useSettingsStore, type Settings } from '@/stores/settings'

const props = defineProps<{
  updatedSettings: Settings
  items: any[]
  url: string
}>()

const emits = defineEmits(['open-qrcode', 'saved', 'error'])

const settingsStore = useSettingsStore()

const newLogo = ref('')
const newFavicon = ref('')
const newQrCodeLogo = ref('')

const updateLogo = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  props.updatedSettings.Logo = file as any
  newLogo.value = URL.createObjectURL(file)
}

const updateFavicon = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  props.updatedSettings.Favicon = file as any
  newFavicon.value = URL.createObjectURL(file)
}

const updateQRCodeLogo = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files ? target.files[0] : undefined
  if (!file) return
  props.updatedSettings.QRCodeLogoImgUrl = file as any
  newQrCodeLogo.value = URL.createObjectURL(file)
}

const saveSettings = async () => {
  try {
    await settingsStore.updateSettings(props.updatedSettings as Settings)
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
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="newspapername">{{ $t('Newspaper name') }}:</label>
      <div class="flex flex-row">
        <input id="newspapername" v-model="props.updatedSettings.NewspaperName" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" required />
      </div>
    </div>

    <!-- Logo -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="logo">Logo:</label>
      <div class="flex flex-col">
        <img v-if="(props.updatedSettings && typeof props.updatedSettings.Logo === 'string') || !props.updatedSettings?.Logo" :src="props.updatedSettings?.Logo && props.updatedSettings?.Logo !== '' ? props.url.replace(/\/$/, '') + props.updatedSettings.Logo : props.url + 'img/logo.png'" alt="Newspaper logo" class="logo my-5" width="200" height="auto" />
        <img v-else :src="newLogo" alt="Newspaper logo2" class="logo my-5" width="200" height="auto" />
        <input id="logo" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="file" accept="image/png" @change="updateLogo" />
      </div>
    </div>

    <!-- Favicon -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="favicon">Favicon:</label>
      <div class="flex flex-col">
        <img v-if="(props.updatedSettings && typeof props.updatedSettings.Favicon === 'string') || !props.updatedSettings?.Favicon" :src="props.updatedSettings?.Favicon && props.updatedSettings?.Favicon !== '' ? props.url + props.updatedSettings.Favicon.slice(1) : props.url + 'img/favicon.png'" alt="Newspaper favicon" class="favicon my-5" width="200" height="auto" />
        <img v-else :src="newFavicon" alt="Newspaper favicon2" class="favicon my-5" width="200" height="auto" />
        <input id="favicon" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="file" accept="image/png" @change="updateFavicon" />
      </div>
    </div>

    <!-- Colors and main item etc. -->
     <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
    <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color">{{ $t('color') }}:</label>
    <div class="flex flex-row">
      <input id="color" v-model="props.updatedSettings.Color" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" required />
    </div>
    </div>
<div>
    <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="color">{{ $t('fontColor') }}:</label>
    <div class="flex flex-row">
      <input id="color" v-model="props.updatedSettings.FontColor" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" required />
    </div>
    </div>
    </div>
    <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="mainItem">{{ $t('mainProduct') }}:</label>
    <div class="flex flex-row">
      <select id="mainItem" v-model="props.updatedSettings.MainItem" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
        <option v-for="item in props.items" :key="item.ID" :value="item.ID">{{ item.Name }}</option>
      </select>
    </div>

    <!-- QR code logo -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcodelogo">{{ $t('QR Code logo') }}:</label>
      <div class="flex flex-col">
        <img v-if="(props.updatedSettings && typeof props.updatedSettings.QRCodeLogoImgUrl === 'string') || !props.updatedSettings?.QRCodeLogoImgUrl" :src="props.updatedSettings?.QRCodeLogoImgUrl && props.updatedSettings?.QRCodeLogoImgUrl !== '' ? props.url + props.updatedSettings.QRCodeLogoImgUrl : props.url + 'img/qrcode.png'" alt="QR code logo" class="favicon  my-5" width="200" height="auto" />
        <img v-else :src="newQrCodeLogo" alt="QR code logo2" class="favicon  my-5" width="200" height="auto" />
        <input id="qrcodelogo" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="file" accept="image/png" @change="updateQRCodeLogo" />
      </div>
    </div>

    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcodeurl">{{ $t('QR Code url') }}:</label>
      <div class="flex flex-row">
        <input id="qrcodeurl" v-model="props.updatedSettings.QRCodeUrl" class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" required />
      </div>
    </div>

    <div class="flex place-content-center">
      <button id="saveSettings" type="submit" class="px-4 py-2 ps-2 mt-2 rounded-full customcolor h-[44px]" @click="saveSettings()">{{ $t('save') }}</button>
    </div>
  </div>
</template>
