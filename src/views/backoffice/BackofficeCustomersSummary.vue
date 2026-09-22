<script lang="ts" setup>
import { useCustomerStore } from '@/stores/customer'
import type { Customer } from '@/stores/customer'
import { ref, computed } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'

const store = useCustomerStore()

useAuthLoad(() => {
  store.getCustomers()
  store.getActiveCustomerIds()
})

const customers = computed(() => store.customers)
const activeCustomerIds = computed(() => store.activeCustomerIds)

const searchQuery = ref('')

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
      <div class="flex justify-between items-center pt-3">
        <h1 class="font-bold text-2xl">{{ $t('menuCustomers') }}</h1>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('SearchPlaceholder')"
          class="aug-input ml-2"
          style="width: auto"
        />
      </div>
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
                  <router-link :to="`/backoffice/customers/${c.id}`">
                    <Button variant="secondary">{{ $t('edit') }}</Button>
                  </router-link>
                </td>
              </tr>
              <tr v-if="displayCustomers.length === 0">
                <td colspan="5" class="p-4 text-center text-gray-500">
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
