<script setup lang="ts">
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{ title: string; showBack?: boolean }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <div class="page-header">
    <button
      v-if="showBack"
      type="button"
      class="aug-icon-btn page-header-back"
      aria-label="Back"
      @click="$emit('back')"
    >
      <font-awesome-icon :icon="faArrowLeft" />
    </button>
    <h1 class="page-header-title">{{ title }}</h1>
    <div v-if="$slots.default" class="page-header-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.page-header-back {
  flex-shrink: 0;
}
.page-header-title {
  font-size: 21px;
  font-weight: 700;
  /* Natural content size, not flex-grow - a growing title was claiming space before actions'
     flex-shrink:1 default got a chance to ask for its own content width, which compressed
     multi-control actions areas (e.g. a date range picker + a button group) below what their
     own children need, forcing them to wrap internally instead of the row wrapping cleanly. */
  flex: 0 1 auto;
  min-width: 0;
}
.page-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  /* nowrap is deliberate: a flex container that wraps its own children reports a much smaller
     max-content size to its parent than the sum of its children (the browser pre-splits it into
     lines using their *min-content* widths before measuring), which was shrinking this whole
     block far below what a date-range picker + button group actually need - even with
     flex-shrink: 0 here, and independent of the title's flex settings. nowrap makes this
     container's intrinsic size the plain sum of its children again, so it either sits next to the
     title on one row, or - since the *outer* .page-header still wraps - drops as a whole to its
     own line. Only reintroduced (below) under the mobile breakpoint, where letting it wrap is
     better than overflowing a narrow screen. */
  flex-wrap: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}
@media (max-width: 767.98px) {
  .page-header-actions {
    flex-wrap: wrap;
  }
}
</style>
