<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4">
          <form @submit.prevent="submitForm" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                Vorname <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.firstName"
                :class="{ 'border-red-500': formErrors.firstName }"
                type="text"
                id="firstName"
                placeholder="Vorname"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p v-if="formErrors.firstName" class="text-red-500 text-xs italic">
                {{ formErrors.firstName }}
              </p>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                Nachname
              </label>
              <input
                v-model="formData.lastName"
                type="text"
                id="lastName"
                placeholder="Nachname"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="sellerNumber">
                VerkäuferInnennummer <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.sellerNumber"
                :class="{ 'border-red-500': formErrors.sellerNumber }"
                type="text"
                id="sellerNumber"
                placeholder="VerkäuferInnennummer"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p v-if="formErrors.sellerNumber" class="text-red-500 text-xs italic">
                {{ formErrors.sellerNumber }}
              </p>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                E-Mail <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.email"
                :class="{ 'border-red-500': formErrors.email }"
                type="email"
                id="email"
                placeholder="E-Mail"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p v-if="formErrors.email" class="text-red-500 text-xs italic">
                {{ formErrors.email }}
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
        firstName: '',
        lastName: '',
        sellerNumber: '',
        email: ''
      },
      formErrors: {
        firstName: '',
        sellerNumber: '',
        email: ''
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
      this.formErrors.firstName = ''
      this.formErrors.sellerNumber = ''
      this.formErrors.email = ''

      if (!this.formData.firstName) {
        this.formErrors.firstName = 'Vorname ist erforderlich.'
      }

      if (!this.formData.sellerNumber) {
        this.formErrors.sellerNumber = 'Verkäufernummer ist erforderlich.'
      }

      if (!this.formData.email) {
        this.formErrors.email = 'E-Mail ist erforderlich.'
      }
    },
    isFormValid() {
      return !this.formErrors.firstName && !this.formErrors.sellerNumber && !this.formErrors.email
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
