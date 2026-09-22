<template>
  <div class="aug-card">
    <slot />
  </div>
</template>

<style scoped>
.aug-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
}
</style>
