import { defineConfig } from 'cypress'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    },
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    excludeSpecPattern: 'cypress/e2e/demo/**',
    baseUrl: 'http://localhost:4173'
  }
})
