<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { settingsImageUrl } from '@/utils/settingsImage'

export type SteckbriefSheetData = {
  FirstName: string
  LastName: string
  LicenseID: string
  Image: string
  Description: string
  Family: string
  Residence: string
  Education: string
  CareerGoal: string
  Support: string
}

type TextField = 'Description' | 'Family' | 'Residence' | 'Education' | 'CareerGoal' | 'Support'

const props = defineProps<{ steckbrief: SteckbriefSheetData }>()

const { t } = useI18n()
const settingsStore = useSettingsStore()

const fields = computed<{ key: TextField; label: string }[]>(() =>
  (
    [
      { key: 'Description', label: t('steckbriefDescription') },
      { key: 'Family', label: t('steckbriefFamily') },
      { key: 'Residence', label: t('steckbriefResidence') },
      { key: 'Education', label: t('steckbriefEducation') },
      { key: 'CareerGoal', label: t('steckbriefCareerGoal') },
      { key: 'Support', label: t('steckbriefSupport') }
    ] as { key: TextField; label: string }[]
  ).filter((f) => (props.steckbrief[f.key] ?? '').trim() !== '')
)

const photoUrl = computed(() =>
  props.steckbrief.Image ? settingsImageUrl(props.steckbrief.Image, '') : ''
)

const logoUrl = computed(() => settingsImageUrl(settingsStore.settings.Logo, '/img/logo.png'))
const hasName = computed(() => !!(props.steckbrief.FirstName || props.steckbrief.LastName))

const initials = computed(
  () =>
    `${props.steckbrief.FirstName.charAt(0)}${props.steckbrief.LastName.charAt(0)}`.toUpperCase() ||
    props.steckbrief.LicenseID.slice(0, 2).toUpperCase()
)

const cardStyle = computed(() => ({
  '--sb-color': settingsStore.settings.Color || '#ffde00',
  '--sb-font-color': settingsStore.settings.FontColor || '#000000'
}))
</script>

<template>
  <article class="sheet" :style="cardStyle">
    <div class="sheet-card">
      <header class="sheet-logo">
        <img :src="logoUrl" :alt="settingsStore.settings.NewspaperName" />
      </header>
      <div class="sheet-person">
        <div class="sheet-photo">
          <img v-if="photoUrl" :src="photoUrl" alt="" />
          <span v-else aria-hidden="true">{{ initials }}</span>
        </div>
        <div class="sheet-id">
          <h2 v-if="hasName" class="sheet-name">
            <span class="sheet-lastname">{{ steckbrief.LastName }}</span>
            <span>{{ steckbrief.FirstName }}</span>
          </h2>
          <span v-else />
          <div class="sheet-license">
            {{ $t('steckbriefLicenseId') }}: {{ steckbrief.LicenseID }}
          </div>
        </div>
      </div>
    </div>
    <dl class="sheet-fields">
      <template v-for="field in fields" :key="field.key">
        <dt>{{ field.label }}</dt>
        <dd>{{ steckbrief[field.key] }}</dd>
      </template>
    </dl>
  </article>
</template>

<style scoped>
.sheet {
  width: 100%;
  container-type: inline-size;
}
.sheet-card {
  border-radius: 14px;
  overflow: hidden;
  background: var(--sb-color);
  color: var(--sb-font-color);
  box-shadow: 0 2px 6px rgb(0 0 0 / 18%);
}
.sheet-logo {
  padding: 18px 24px;
}
.sheet-logo img {
  max-height: 56px;
  max-width: 100%;
  display: block;
}
.sheet-person {
  display: grid;
  grid-template-columns: 38% 1fr;
  background: #fff;
  color: #000;
}
/* At least portrait-shaped, and as tall as the name column next to it */
.sheet-photo {
  position: relative;
  overflow: hidden;
  background: #e5e5e5;
  color: #777;
  font-size: 40px;
  font-weight: 700;
}
.sheet-photo::before {
  content: '';
  display: block;
  padding-top: 120%;
}
.sheet-photo img,
.sheet-photo span {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.sheet-photo img {
  object-fit: cover;
}
.sheet-photo span {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-id {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.sheet-name {
  margin: 0;
  padding: clamp(12px, 4cqi, 24px) clamp(12px, 3.5cqi, 20px);
  font-size: clamp(16px, 5cqi, 26px);
  line-height: 1.25;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  overflow-wrap: break-word;
  hyphens: auto;
}
.sheet-lastname {
  text-transform: uppercase;
}
.sheet-license {
  padding: clamp(10px, 2.5cqi, 14px) clamp(12px, 3.5cqi, 20px);
  background: var(--sb-color);
  color: var(--sb-font-color);
  font-size: clamp(13px, 3cqi, 16px);
  font-weight: 600;
}
.sheet-fields {
  margin: 24px 8px 0;
  font-size: 15px;
  line-height: 1.45;
}
.sheet-fields dt {
  font-weight: 700;
}
.sheet-fields dd {
  margin: 0 0 14px;
  white-space: pre-line;
}

@media print {
  .sheet,
  .sheet * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
