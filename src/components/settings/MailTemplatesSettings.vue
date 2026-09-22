<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMailTemplatesStore } from '@/stores/mailTemplates'
import Card from '@/components/ui/Card.vue'
import FormField from '@/components/ui/FormField.vue'
import Button from '@/components/ui/Button.vue'

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
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' }
  ],
  'digitalLicenceItemTemplate.html': [
    { name: '{{.URL}}', desc: 'Link zur Online-Ausgabe' },
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' },
    { name: '{{.InviteURL}}', desc: 'Einmaliger WordPress-Login-Link (optional)' }
  ],
  'PDFLicenceItemTemplate.html': [
    { name: '{{.URL}}', desc: 'Download-Link zum PDF' },
    { name: '{{.EMAIL}}', desc: 'E-Mail-Adresse der Käuferin' }
  ],
  abonementConfirmation: [
    { name: '{{.CustomerName}}', desc: 'Vor- und Nachname der Kundin' },
    { name: '{{.ItemName}}', desc: 'Name des Abonnements' },
    { name: '{{.FromDate}}', desc: 'Startdatum (YYYY-MM-DD)' },
    { name: '{{.ToDate}}', desc: 'Enddatum (YYYY-MM-DD)' },
    { name: '{{.Status}}', desc: 'Status des Abonnements' },
    { name: '{{.InviteURL}}', desc: 'Einmaliger WordPress-Login-Link (optional)' }
  ],
  onlineIssuePublished: [
    { name: '{{.IssueName}}', desc: 'Name der Ausgabe' },
    { name: '{{.ImageURL}}', desc: 'URL zum Titelbild' }
  ]
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
  ImageURL: 'https://placehold.co/600x400?text=Augustin+Cover'
}

function renderPreview(body: string): string {
  let s = body

  // {{if .X}}...{{else}}...{{end}}
  s = s.replace(
    /\{\{if \.(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{end\}\}/g,
    (_, varName, ifBlock, elseBlock) => (DEMO_VALUES[varName] !== undefined ? ifBlock : elseBlock)
  )

  // {{if .X}}...{{end}} (no else)
  s = s.replace(/\{\{if \.(\w+)\}\}([\s\S]*?)\{\{end\}\}/g, (_, varName, block) =>
    DEMO_VALUES[varName] !== undefined ? block : ''
  )

  // {{.X}}
  s = s.replace(/\{\{\.(\w+)\}\}/g, (_, varName) => DEMO_VALUES[varName] ?? `[${varName}]`)
  return s
}

const previewBody = computed(() =>
  mailStore.current?.body ? renderPreview(mailStore.current.body) : ''
)

onMounted(() => {
  loadList()
})
</script>

<template>
  <Card>
    <div class="settings-grid">
      <!-- Template list -->
      <div>
        <h2 class="section-title">{{ $t('Mail Templates') }}</h2>
        <ul class="template-list">
          <li v-for="t in templates" :key="'temp_' + t.ID">
            <button
              type="button"
              class="template-item"
              :class="{ 'template-item-active': mailStore.current?.name === t.Name }"
              @click="selectTemplate(t.Name)"
            >
              {{ $t('mailTemplate_' + t.Name, t.Name) }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Editor -->
      <div class="editor-col">
        <template v-if="mailStore.current && mailStore.current.name">
          <FormField :label="$t('Subject')">
            <input v-model="mailStore.current.subject" class="aug-input" />
          </FormField>

          <div class="body-header">
            <span class="body-label">{{ $t('Body') }}</span>
            <div class="view-toggle">
              <button
                type="button"
                class="view-toggle-btn"
                :class="{ 'view-toggle-btn-active': bodyTab === 'edit' }"
                @click="bodyTab = 'edit'"
              >
                {{ $t('edit') }}
              </button>
              <button
                type="button"
                class="view-toggle-btn"
                :class="{ 'view-toggle-btn-active': bodyTab === 'preview' }"
                @click="bodyTab = 'preview'"
              >
                {{ $t('preview') }}
              </button>
            </div>
          </div>
          <textarea
            v-if="bodyTab === 'edit'"
            ref="textareaRef"
            v-model="mailStore.current.body"
            class="aug-input body-textarea"
            @keyup="saveCursor"
            @mouseup="saveCursor"
            @blur="saveCursor"
          ></textarea>
          <iframe
            v-else
            class="body-preview"
            :srcdoc="previewBody"
            sandbox="allow-same-origin"
          ></iframe>

          <!-- Variable chips -->
          <div v-if="currentVars.length" class="vars-box">
            <p class="vars-label">{{ $t('templateVars') }}</p>
            <div class="vars-list">
              <button
                v-for="v in currentVars"
                :key="v.name"
                type="button"
                class="var-chip"
                :title="v.desc"
                @click="insertVar(v.name)"
              >
                <code class="var-chip-code">{{ v.name }}</code>
                <span class="var-chip-desc">— {{ v.desc }}</span>
              </button>
            </div>
          </div>

          <FormField :label="$t('Test email')">
            <div class="input-with-action">
              <input v-model="testEmail" placeholder="example@domain.tld" class="aug-input" />
              <Button
                variant="secondary"
                :disabled="mailStore.loading || !mailStore.current.name"
                @click="testTemplate"
              >
                {{ $t('Test') }}
              </Button>
            </div>
          </FormField>

          <div class="save-row">
            <Button variant="primary" @click="saveTemplate()">{{ $t('save') }}</Button>
          </div>
        </template>
        <p v-else class="empty-hint">{{ $t('selectTemplateHint') }}</p>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.template-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.template-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.template-item:hover {
  background: var(--color-surface-alt);
}
.template-item-active {
  background: var(--color-accent-tint);
  color: var(--color-accent);
  font-weight: 600;
}
.editor-col {
  min-width: 0;
}
.body-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 6px;
}
.body-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.body-textarea {
  height: 256px;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  resize: vertical;
}
.body-preview {
  width: 100%;
  height: 256px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.view-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.view-toggle-btn {
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.view-toggle-btn-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.vars-box {
  margin: 14px 0;
  padding: 12px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.vars-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.vars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.var-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 12px;
  cursor: pointer;
}
.var-chip:hover {
  border-color: var(--color-accent);
}
.var-chip-code {
  font-family: ui-monospace, monospace;
  color: var(--color-accent);
}
.var-chip-desc {
  color: var(--color-text-muted);
}
.input-with-action {
  display: flex;
  gap: 8px;
}
.input-with-action .aug-input {
  flex: 1;
}
.save-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.empty-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

@media (max-width: 800px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
