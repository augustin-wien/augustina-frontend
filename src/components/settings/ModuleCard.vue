<script setup lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

defineProps<{
  title: string
  description: string
  icon: IconDefinition
}>()

const enabled = defineModel<boolean>()
</script>

<template>
  <Card class="module" :class="{ 'module-off': !enabled }">
    <div class="module-head">
      <span class="module-icon"><FontAwesomeIcon :icon="icon" /></span>
      <div class="module-text">
        <div class="module-title">
          <h3>{{ title }}</h3>
          <Badge :variant="enabled ? 'success' : 'neutral'">
            {{ enabled ? $t('moduleActive') : $t('moduleInactive') }}
          </Badge>
        </div>
        <p class="module-description">{{ description }}</p>
      </div>
      <label class="aug-toggle module-switch" :title="title">
        <input v-model="enabled" type="checkbox" :aria-label="title" />
        <span class="aug-toggle-track"></span>
      </label>
    </div>
    <div v-if="enabled && $slots.default" class="module-body">
      <slot />
    </div>
  </Card>
</template>

<style scoped>
.module-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.module-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius);
  background: var(--color-accent-tint);
  color: var(--color-accent);
  font-size: 16px;
}
.module-off .module-icon {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}
.module-text {
  flex: 1;
  min-width: 0;
}
.module-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.module-title h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}
.module-description {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}
.module-switch {
  flex: none;
  margin-top: 6px;
}
.module-body {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>
