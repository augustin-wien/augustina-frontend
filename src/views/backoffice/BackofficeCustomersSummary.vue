<script lang="ts" setup>
import { useCustomerStore } from '@/stores/customer'
import type { Customer } from '@/stores/customer'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { exportAsCsv } from '@/utils/utils'
import { newsletterCsvRows } from '@/utils/newsletterCsv'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const store = useCustomerStore()
const { t } = useI18n()

useAuthLoad(() => {
  store.getCustomers()
  store.getActiveCustomerIds()
})

const customers = computed(() => store.customers)
const activeCustomerIds = computed(() => store.activeCustomerIds)

const searchQuery = ref('')

const newsletterCount = computed(() => customers.value.filter((c: Customer) => c.newsletter).length)

const exportNewsletter = () => {
  const rows = newsletterCsvRows(customers.value, [
    t('E-Mail'),
    t('firstName'),
    t('lastName'),
    t('newsletterSubscribedAt')
  ])

  exportAsCsv(rows, `newsletter_${new Date().toISOString().slice(0, 10)}`)
}

const displayCustomers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return customers.value
  return customers.value.filter(
    (c: Customer) =>
      c.email.toLowerCase().includes(q) ||
      c.firstname.toLowerCase().includes(q) ||
      c.lastname.toLowerCase().includes(q)
  )
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuCustomers')">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('SearchPlaceholder')"
          class="aug-input"
          style="width: auto"
        />
        <Button variant="secondary" :disabled="newsletterCount === 0" @click="exportNewsletter">
          {{ $t('newsletterExport', { count: newsletterCount }) }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <div class="main">
        <Card>
          <table class="aug-table">
            <thead>
              <tr>
                <th>{{ $t('firstName') }}</th>
                <th>{{ $t('lastName') }}</th>
                <th>{{ $t('email') }}</th>
                <th>{{ $t('abonements') }}</th>
                <th>{{ $t('newsletter') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in displayCustomers" :key="c.id">
                <td>{{ c.firstname }}</td>
                <td>{{ c.lastname }}</td>
                <td>{{ c.email }}</td>
                <td>
                  <Badge v-if="activeCustomerIds.has(c.id)" variant="success">
                    {{ $t('active') }}
                  </Badge>
                </td>
                <td>
                  <Badge v-if="c.newsletter" variant="success">{{ $t('yes') }}</Badge>
                </td>
                <td>
                  <router-link :to="`/backoffice/customers/${c.id}`">
                    <Button variant="secondary">{{ $t('edit') }}</Button>
                  </router-link>
                </td>
              </tr>
              <tr v-if="displayCustomers.length === 0">
                <td colspan="6" class="p-4 text-center text-gray-500">
                  {{ $t('noCustomers') }}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
      <footer>
        <router-link to="/backoffice/customers/new">
          <button class="p-3 rounded-full customcolor fixed bottom-10 right-10 h-16 w-16">
            <font-awesome-icon :icon="faPlus" />
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>
