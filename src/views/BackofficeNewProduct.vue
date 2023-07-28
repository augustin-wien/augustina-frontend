<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <h1 className="font-bold underline mt-3 pt-3">Neues Produkt anlegen</h1>
        <div class="w-full max-w-md mx-auto mt-4">
          <form @submit.prevent="submitForm" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                :class="{ 'border-red-500': formErrors.name }"
                type="text"
                id="Name"
                placeholder="Name"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p v-if="formErrors.name" class="text-red-500 text-xs italic">
                {{ formErrors.name }}
              </p>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="type"> Typ </label>
              <input
                v-model="formData.type"
                type="text"
                id="type"
                placeholder="Typ"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="Preis">
                Preis <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.price"
                :class="{ 'border-red-500': formErrors.price }"
                type="text"
                id="price"
                placeholder="Preis"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p v-if="formErrors.price" class="text-red-500 text-xs italic">
                {{ formErrors.price }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <button
                type="submit"
                class="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Anlegen
              </button>
            </div>
          </form>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      formData: {
        name: '',
        type: '',
        price: ''
      },
      formErrors: {
        name: '',
        price: '',
        type: ''
      }
    }
  },
  methods: {
    submitForm() {
      // Validierung hier durchführen
      this.validateForm()
      if (this.isFormValid()) {
        // Aktion, um den Verkäufer anzulegen, hier ausführen
        console.log('Formular ist gültig. Verkäufer anlegen:', this.formData)
      }
    },
    validateForm() {
      this.formErrors.name = ''
      this.formErrors.type = ''
      this.formErrors.price = ''

      if (!this.formData.name) {
        this.formErrors.name = 'Name ist erforderlich.'
      }

      if (!this.formData.type) {
        this.formErrors.type = 'Typ ist erforderlich.'
      }

      if (!this.formData.price) {
        this.formErrors.price = 'Preis ist erforderlich.'
      }
    },
    isFormValid() {
      return !this.formErrors.name && !this.formErrors.type && !this.formErrors.price
    }
  }
})
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
