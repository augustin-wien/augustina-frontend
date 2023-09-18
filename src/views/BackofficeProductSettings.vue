<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold text-3xl mt-3 pt-3">Produkte</h1>
          <router-link to="/backoffice/newproduct">
            <button className="p-3 mt-2 rounded-full bg-lime-600 text-white">Neu</button>
          </router-link>
          <div class="overflow-x-auto">
            <table class="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th class="p-3">Name</th>
                  <th class="p-3">Beschreibung</th>
                  <th class="p-3">Logo</th>
                  <th class="p-3">Preis</th>
                </tr>
              </thead>
              <tbody class="text-sm p-3">
                <tr v-for="(item, ID) in items" :key="ID">
                  <td class="p-3 font-bold">{{ item.Name }}</td>
                  <td class="p-3 font-light">{{ item.Description }}</td>
                  <td class="p-3">
                    <img
                      :src="item.Image"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                    />
                  </td>
                  <td class="p-3 font-light">{{ item.Price }} Euro</td>
                  <td class="p-3">
                    <router-link :to="`/backoffice/productsettings/update/${item.ID}`">
                      <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { itemStore } from '../stores/items'
import { computed, onMounted } from 'vue'

const store = itemStore()

// Fetch the items' data when the component is mounted
onMounted(() => {
  store.getItems()
})
const items = computed(() => store.items)
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
