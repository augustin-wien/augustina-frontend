import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiInstance } from '@/api/api'
import { MAIL_TEMPLATES_API } from '@/api/endpoints'

type MailTemplateResponse = {
  ID: number
  Name: string
  Subject: string
  Body: string
  CreatedAt?: string
  UpdatedAt?: string
}

interface MailTemplate {
  name: string
  subject: string
  body: string
}

export const useMailTemplatesStore = defineStore('mailTemplates', () => {
  const templates = ref<MailTemplateResponse[]>([])
  const current = ref<MailTemplate>({ name: '', subject: '', body: '' })
  const loading = ref(false)

  async function loadList() {
    try {
      loading.value = true
      const res = await apiInstance.get(MAIL_TEMPLATES_API)

      if (res && res.data && Array.isArray(res.data)) {
        templates.value = res.data as MailTemplateResponse[]
      }

      //   replace current with loaded template if exists
      const existing = templates.value.find((t) => t.Name === current.value.name)

      if (existing) {
        current.value = {
          name: existing.Name,
          subject: existing.Subject,
          body: existing.Body
        }
      }
    } finally {
      loading.value = false
    }
  }

  async function selectTemplate(name: string) {
    try {
      loading.value = true
      const res = await apiInstance.get(`${MAIL_TEMPLATES_API}${encodeURIComponent(name)}/`)

      if (res && res.data) {
        const d = res.data as MailTemplateResponse

        current.value = {
          name: d.Name || name,
          subject: d.Subject || '',
          body: d.Body || ''
        }
      }
    } finally {
      loading.value = false
    }
  }

  function newTemplate() {
    current.value = { name: '', subject: '', body: '' }
  }

  async function saveTemplate() {
    try {
      loading.value = true

      const payload = {
        Name: current.value.name,
        Subject: current.value.subject,
        Body: current.value.body
      }

      await apiInstance.post(MAIL_TEMPLATES_API, JSON.stringify(payload), {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      await loadList()
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(name: string) {
    try {
      loading.value = true
      await apiInstance.delete(`${MAIL_TEMPLATES_API}${encodeURIComponent(name)}/`)
      await loadList()
      newTemplate()
    } finally {
      loading.value = false
    }
  }

  /**
   * Send a test email for the given template name.
   * Expects payload: { to: string[], data: Record<string, any> }
   */
  async function sendTemplate(name: string, to: string[] = [], data?: Record<string, unknown>) {
    try {
      loading.value = true
      const url = `${MAIL_TEMPLATES_API}${encodeURIComponent(name)}/send/`

      const payload: Record<string, unknown> = {}
      if (to && to.length > 0) payload.to = to
      if (data) payload.data = data

      return await apiInstance.post(url, JSON.stringify(payload), {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
    } finally {
      loading.value = false
    }
  }

  return {
    templates,
    current,
    loading,
    loadList,
    selectTemplate,
    newTemplate,
    saveTemplate,
    deleteTemplate,
    sendTemplate
  }
})
