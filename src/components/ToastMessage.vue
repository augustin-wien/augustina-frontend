<template>
  <div v-if="toast" :class="toastClasses" class="toast">
    <svg
      class="w-5 h-5 text-blue-600 dark:text-blue-500 rotate-45"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 20"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 17 8 2L9 1 1 19l8-2Zm0 0V9"
      />
    </svg>
    <div class="pl-4 text-sm font-normal">{{ toast.message }}</div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    toast: {
      type: Object,
      default: null
    }
  },
  computed: {
    toastClasses() {
      if (this.toast.type === 'success') {
        return 'flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800'
      } else if (this.toast.type === 'error') {
        return 'flex items-center w-full max-w-xs p-4 space-x-4 text-red-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-red-400 dark:divide-red-700 space-x dark:bg-red-800'
      } else {
        return '' // Add more conditions if needed
      }
    }
  }
}
</script>

<style>
.toastClasses {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
