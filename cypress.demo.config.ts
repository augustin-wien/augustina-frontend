import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/demo/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'https://shop.demo.augustina.cc',
    video: false,
    retries: { runMode: 1, openMode: 0 },
    env: {
      vendorLicenseId: 'fl-123'
    }
  }
})
