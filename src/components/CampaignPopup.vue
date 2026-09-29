<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'
import { useCampaignsStore, type ActiveCampaign } from '@/stores/campaigns'

const settStore = useSettingsStore()
const shopStore = useShopStore()
const campaignsStore = useCampaignsStore()

const apiUrl = import.meta.env.VITE_API_URL

const seenKey = (id: number) => `campaign-seen:${id}`

const isSeen = (id: number) => {
  try {
    return window.localStorage.getItem(seenKey(id)) === 'true'
  } catch {
    return false
  }
}

const markSeen = (id: number) => {
  try {
    window.localStorage.setItem(seenKey(id), 'true')
  } catch {
    // Storage blocked: campaignsStore.popupShown still keeps it closed for this visit
  }
}

const activeCampaigns = ref<ActiveCampaign[]>([])
const campaign = ref<ActiveCampaign | null>(null)

onMounted(async () => {
  activeCampaigns.value = await campaignsStore.getActiveCampaigns()
})

// Only items the shop actually sells can be advertised — a disabled or archived item is not in
// shopStore.items, and then its campaign simply stays away.
const itemFor = (c: ActiveCampaign) => shopStore.items.find((i) => i.ID === c.item_id)

// Pick the newest campaign this customer hasn't seen yet, once both the campaigns and the items
// have arrived. At most one popup per visit.
watch(
  () => [activeCampaigns.value, shopStore.items.length] as const,
  () => {
    if (campaign.value || campaignsStore.popupShown) return

    const next = activeCampaigns.value.find((c) => itemFor(c) && !isSeen(c.id))

    if (!next) return

    campaign.value = next
    campaignsStore.popupShown = true
    // Counted as seen as soon as it is shown, so a reload doesn't show it (or count it) again
    markSeen(next.id)
    campaignsStore.track(next.id, 'view')
  },
  { immediate: true }
)

const item = computed(() => (campaign.value ? itemFor(campaign.value) : undefined))

const close = () => {
  campaign.value = null
}

const choose = () => {
  if (!campaign.value || !item.value) return

  campaignsStore.track(campaign.value.id, 'click')
  // The advertised product replaces the preselected main product rather than being added to it.
  shopStore.reset()
  shopStore.addItem(item.value.ID)
  close()
}
</script>

<template>
  <div
    v-if="campaign && item"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
    @click.self="close"
  >
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="campaign.title || item.Name"
      class="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
    >
      <button
        type="button"
        class="absolute right-4 top-3 text-2xl text-gray-500"
        :aria-label="$t('campaignDismiss')"
        @click="close"
      >
        ✕
      </button>

      <h2 v-if="campaign.title" class="mb-3 pr-6 text-2xl font-bold">
        {{ campaign.title }}
      </h2>

      <div
        v-if="item.Image"
        class="mb-4 h-40 w-full rounded-2xl bg-cover bg-center"
        :style="{ backgroundImage: `url(${apiUrl}${item.Image})` }"
      ></div>

      <p v-if="campaign.text" class="mb-4 whitespace-pre-line text-base">
        {{ campaign.text }}
      </p>

      <div
        class="mb-4 flex h-14 w-full items-center justify-center rounded-full text-center text-xl font-semibold"
        :style="{
          'background-color': item.ItemColor || '#000000',
          color: item.ItemTextColor || '#ffffff'
        }"
      >
        {{ item.Name }} {{ (item.Price / 100).toFixed(2) }}€
      </div>

      <button
        id="campaign-choose"
        type="button"
        class="customcolor w-full rounded-full p-4 text-2xl font-semibold"
        @click="choose"
      >
        {{ $t('campaignChoose') }}
      </button>
      <button type="button" class="mt-3 w-full text-center text-gray-500 underline" @click="close">
        {{ $t('campaignDismiss') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}
</style>
