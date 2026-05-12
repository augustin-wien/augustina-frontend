<script lang="ts" setup>
import { useCustomerStore } from '@/stores/customer'
import type { Customer } from '@/stores/customer'
import { ref, computed } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
          class="border-2 border-gray-400 rounded-md p-2 ml-2"
        />
      </div>
    </template>

    <template #main>
      <div class="main">
        <div class="mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <table class="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th class="p-3 text-left">{{ $t('firstName') }}</th>
                <th class="p-3 text-left">{{ $t('lastName') }}</th>
                <th class="p-3 text-left">{{ $t('email') }}</th>
                <th class="p-3 text-left">{{ $t('abonements') }}</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="c in displayCustomers" :key="c.id" class="border-t-2">
                <td class="p-3">{{ c.firstname }}</td>
                <td class="p-3">{{ c.lastname }}</td>
                <td class="p-3">{{ c.email }}</td>
                <td class="p-3">
                  <span
                    v-if="activeCustomerIds.has(c.id)"
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-lime-100 text-lime-800"
                  >
                    {{ $t('active') }}
                  </span>
                </td>
                <td class="p-3">
                  <router-link :to="`/backoffice/customers/${c.id}`">
                    <button class="py-1 px-3 rounded-full customcolor">
                      {{ $t('edit') }}
                    </button>
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
        </div>
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

<style scoped>
td {
  padding: 10px;
}
</style>
