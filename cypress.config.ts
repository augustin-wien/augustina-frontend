import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    excludeSpecPattern: 'cypress/e2e/demo/**',
    baseUrl: 'http://localhost:4173'
  }
})
