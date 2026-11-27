import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.mts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['src/__tests__/support/setup.ts'],
      testTimeout: 20000,
      env: { VITE_API_URL: 'http://localhost:3000/' },
      server: { deps: { inline: [/leaflet/] } },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
        reporter: ['text-summary', 'html', 'json-summary'],
        thresholds: { lines: 80, statements: 80, functions: 73, branches: 70 }
      }
    }
  })
)
