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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4"
    @click.self="close"
  >
    <!-- The dialog never grows beyond the screen: the content scrolls, the buttons stay visible.
         It has to work down to an iPhone SE (320 x 568). -->
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="campaign.title || item.Name"
      class="relative flex max-h-full w-full max-w-sm flex-col rounded-3xl bg-white p-5 shadow-xl"
    >
      <button
        type="button"
        class="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-3xl leading-none text-gray-800"
        :aria-label="$t('campaignDismiss')"
        @click="close"
      >
        ✕
      </button>

      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <h2 v-if="campaign.title" class="mb-3 shrink-0 pr-10 text-xl font-bold">
          {{ campaign.title }}
        </h2>

        <!-- The product image takes the space the rest leaves and is never cropped. On a small
             screen it shrinks down to a minimum height before the content starts to scroll. -->
        <img
          v-if="item.Image"
          :src="`${apiUrl}${item.Image}`"
          :alt="item.Name"
          class="campaign-image mx-auto w-full rounded-2xl object-contain"
          :class="{ 'mt-8': !campaign.title }"
        />

        <p class="mt-2 shrink-0 text-center text-lg font-semibold">
          {{ item.Name }} {{ (item.Price / 100).toFixed(2) }}€
        </p>

        <p v-if="campaign.text" class="mt-2 shrink-0 whitespace-pre-line text-base">
          {{ campaign.text }}
        </p>
      </div>

      <div class="mt-4 flex shrink-0 flex-col gap-3">
        <button
          id="campaign-choose"
          type="button"
          class="customcolor h-14 w-full rounded-full text-xl font-semibold"
          @click="choose"
        >
          {{ $t('campaignChoose') }}
        </button>
        <button
          type="button"
          class="customcolor h-14 w-full rounded-full text-xl font-semibold"
          @click="close"
        >
          {{ $t('campaignDismiss') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaign-image {
  min-height: 30vh;
  min-height: 30dvh;
  max-height: 50vh;
  max-height: 50dvh;
}
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}
</style>
