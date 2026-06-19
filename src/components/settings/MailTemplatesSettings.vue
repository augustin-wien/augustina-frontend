<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
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

const templates = computed(() => mailStore.templates)

const bodyTab = ref<'edit' | 'preview'>('edit')

const TEMPLATE_VARS: Record<string, { name: string; desc: string }[]> = {
  welcome: [
    { name: '{{.URL}}', desc: 'Link zur Online-Ausgabe' },
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' },
  ],
  'digitalLicenceItemTemplate.html': [
    { name: '{{.URL}}', desc: 'Link zur Online-Ausgabe' },
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' },
    { name: '{{.InviteURL}}', desc: 'Einmaliger WordPress-Login-Link (optional)' },
  ],
  'PDFLicenceItemTemplate.html': [
    { name: '{{.URL}}', desc: 'Download-Link zum PDF' },
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' },
  ],
  abonementConfirmation: [
    { name: '{{.CustomerName}}', desc: 'Vor- und Nachname der Kundin' },
    { name: '{{.ItemName}}', desc: 'Name des Abonnements' },
    { name: '{{.FromDate}}', desc: 'Startdatum (YYYY-MM-DD)' },
    { name: '{{.ToDate}}', desc: 'Enddatum (YYYY-MM-DD)' },
    { name: '{{.Status}}', desc: 'Status des Abonnements' },
    { name: '{{.InviteURL}}', desc: 'Einmaliger WordPress-Login-Link (optional)' },
  ],
  onlineIssuePublished: [
    { name: '{{.IssueName}}', desc: 'Name der Ausgabe' },
    { name: '{{.ImageURL}}', desc: 'URL zum Titelbild' },
  ],
}

const currentVars = computed(() =>
  mailStore.current?.name ? (TEMPLATE_VARS[mailStore.current.name] ?? []) : []
)

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const savedCursor = ref({ start: 0, end: 0 })

const saveCursor = () => {
  const el = textareaRef.value
  if (el) savedCursor.value = { start: el.selectionStart, end: el.selectionEnd }
}

const insertVar = (v: string) => {
  if (!mailStore.current) return
  const body = mailStore.current.body ?? ''
  const { start, end } = savedCursor.value
  mailStore.current.body = body.slice(0, start) + v + body.slice(end)
  const newPos = start + v.length
  savedCursor.value = { start: newPos, end: newPos }
  nextTick(() => {
    const el = textareaRef.value
    if (el) {
      el.focus()
      el.setSelectionRange(newPos, newPos)
    }
  })
}

const DEMO_VALUES: Record<string, string> = {
  URL: 'https://augustin.wien/zeitung',
  EMAIL: 'maria.muster@example.com',
  InviteURL: 'https://augustin.wien/wp-login/einmaliger-link-abc123',
  CustomerName: 'Maria Muster',
  ItemName: 'Jahresabo digital',
  FromDate: '2026-01-01',
  ToDate: '2026-12-31',
  Status: 'active',
  IssueName: 'Augustin Ausgabe Juni 2026',
  ImageURL: 'https://placehold.co/600x400?text=Augustin+Cover',
}

function renderPreview(body: string): string {
  let s = body
  // {{if .X}}...{{else}}...{{end}}
  s = s.replace(
    /\{\{if \.(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{end\}\}/g,
    (_, varName, ifBlock, elseBlock) =>
      DEMO_VALUES[varName] !== undefined ? ifBlock : elseBlock,
  )
  // {{if .X}}...{{end}} (no else)
  s = s.replace(
    /\{\{if \.(\w+)\}\}([\s\S]*?)\{\{end\}\}/g,
    (_, varName, block) => (DEMO_VALUES[varName] !== undefined ? block : ''),
  )
  // {{.X}}
  s = s.replace(/\{\{\.(\w+)\}\}/g, (_, varName) => DEMO_VALUES[varName] ?? `[${varName}]`)
  return s
}

const previewBody = computed(() =>
  mailStore.current?.body ? renderPreview(mailStore.current.body) : '',
)

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div class="grid grid-cols-3 gap-6">
        <!-- Template list -->
        <div class="col-span-1">
          <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('Mail Templates') }}</h2>
          <ul class="space-y-2">
            <li v-for="t in templates" :key="'temp_' + t.ID">
              <button
                class="w-full text-left rounded px-3 py-2 text-sm font-medium transition-colors"
                :class="
                  mailStore.current?.name === t.Name
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                "
                @click="selectTemplate(t.Name)"
              >
                {{ $t('mailTemplate_' + t.Name, t.Name) }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Editor -->
        <div class="col-span-2">
          <div v-if="mailStore.current && mailStore.current.name">
            <!-- Subject -->
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Subject') }}</label>
            <input v-model="mailStore.current.subject" class="w-full border rounded px-3 py-2 mb-4 text-gray-700" />

            <!-- Body with Edit/Preview tabs -->
            <div class="mb-1 flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">{{ $t('Body') }}</label>
              <div class="flex gap-1">
                <button
                  type="button"
                  class="px-3 py-1 text-xs rounded"
                  :class="bodyTab === 'edit' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="bodyTab = 'edit'"
                >{{ $t('edit') }}</button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs rounded"
                  :class="bodyTab === 'preview' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="bodyTab = 'preview'"
                >{{ $t('preview') }}</button>
              </div>
            </div>
            <textarea
              v-if="bodyTab === 'edit'"
              ref="textareaRef"
              v-model="mailStore.current.body"
              class="w-full border rounded px-3 py-2 h-64 mb-2 text-gray-700 font-mono text-sm"
              @keyup="saveCursor"
              @mouseup="saveCursor"
              @blur="saveCursor"
            ></textarea>
            <iframe
              v-else
              class="w-full border rounded h-64 mb-2 bg-white"
              :srcdoc="previewBody"
              sandbox="allow-same-origin"
            ></iframe>

            <!-- Variable chips -->
            <div v-if="currentVars.length" class="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ $t('templateVars') }}</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="v in currentVars"
                  :key="v.name"
                  type="button"
                  class="group flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-300 text-xs hover:border-gray-500 transition-colors"
                  :title="v.desc"
                  @click="insertVar(v.name)"
                >
                  <code class="font-mono text-indigo-700">{{ v.name }}</code>
                  <span class="text-gray-400 group-hover:text-gray-600">— {{ v.desc }}</span>
                </button>
              </div>
            </div>

            <!-- Test email -->
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Test email') }}</label>
            <div class="flex gap-2 mb-4">
              <input
                v-model="testEmail"
                placeholder="example@domain.tld"
                class="flex-1 border rounded px-3 py-2 text-gray-700"
              />
              <button
                type="button"
                class="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                :disabled="mailStore.loading || !mailStore.current.name"
                @click="testTemplate"
              >
                {{ $t('Test') }}
              </button>
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                class="px-6 py-2 rounded-full customcolor font-semibold"
                @click="saveTemplate()"
              >
                {{ $t('save') }}
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 mt-2">{{ $t('selectTemplateHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
