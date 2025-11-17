<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMailTemplatesStore } from '@/stores/mailTemplates'

const emits = defineEmits<{
  (e: 'saved', message: string): void
  (e: 'error', message: string): void
}>()

const mailStore = useMailTemplatesStore()

const { t: i18n } = useI18n()

const testEmail = ref('')

const loadList = async () => {
  try {
    await mailStore.loadList()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error loading mail templates', err)
    emits('error', 'Failed to load templates')
  }
}

const selectTemplate = async (name: string) => {
  try {
    await mailStore.selectTemplate(name)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching mail template', err)
    emits('error', 'Failed to fetch template')
  }
}

const newTemplate = () => {
  mailStore.newTemplate()
}

const saveTemplate = async () => {
  try {
    await mailStore.saveTemplate()
    await mailStore.loadList()
    emits('saved', 'Template saved')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving mail template', err)
    emits('error', 'Error saving template')
  }
}

// body is edited via textarea bound to store; no contenteditable syncing needed

const testTemplate = async () => {
  if (!mailStore.current.name) {
    emits('error', 'No template selected')
    return
  }

  try {
    // build recipients array (comma-separated allowed)
    const to = testEmail.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (to.length === 0) {
      emits('error', i18n('Provide at least one recipient'))
      return
    }

    // prepare data payload for template rendering on server
    const data = {
      Subject: mailStore.current.subject,
      Body: mailStore.current.body
    }

    await mailStore.sendTemplate(mailStore.current.name, to, data)
    emits('saved', 'Test email sent')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error sending test email', err)
    emits('error', 'Error sending test email')
  }
}

const removeTemplate = async (name: string) => {
  if (!confirm(`Delete template ${name}?`)) return

  try {
    await mailStore.deleteTemplate(name)
    emits('saved', 'Template deleted')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting template', err)
    emits('error', 'Error deleting template')
  }
}

const templates = computed(() => mailStore.templates)

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="mail-templates">
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-1">
        <div class="mb-2 flex justify-between items-center">
          <h3 class="font-bold">{{ $t('Mail Templates') }}</h3>
        </div>
        <ul class="list-disc pl-5">
          <li v-for="t in templates" :key="'temp_' + t.ID" class="mb-1">
            <button class="cursor-pointer rounded px-2 py-1 bg-green-600 text-white" @click="selectTemplate(t.Name)">{{ t.Name }}</button>
          </li>
        </ul>
      </div>
      <div class="col-span-2">
        <div v-if="mailStore.current && mailStore.current.name" class="bg-white p-4 rounded shadow-md">
          <label class="block text-sm font-bold mb-1">{{ $t('Name') }}</label>
          <input v-model="mailStore.current.name" class="w-full border rounded py-2 px-3 mb-2 bg-gray-200" disabled />
          <label class="block text-sm font-bold mb-1">{{ $t('Subject') }}</label>
          <input v-model="mailStore.current.subject" class="w-full border rounded py-2 px-3 mb-2" />
          <label class="block text-sm font-bold mb-1">{{ $t('Body') }}</label>
          <textarea v-model="mailStore.current.body" class="w-full border rounded py-2 px-3 h-52 mb-2"></textarea>

          <label class="block text-sm font-bold mb-1 mt-2">{{ $t('Test email') }}</label>
          <div class="flex gap-2 mb-2">
            <input v-model="testEmail" placeholder="example@domain.tld" class="w-full border rounded py-2 px-3" />
            <button
              type="button"
              class="px-4 py-2 rounded bg-blue-600 text-white"
              :disabled="mailStore.loading || !mailStore.current.name"
              @click="testTemplate"
            >
              {{ $t('Test') }}
            </button>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50 cursor-pointers"
              @click="saveTemplate()"
            >
              {{ $t('save') }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
