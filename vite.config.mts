import { writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'

const e2eBaseline: Record<string, unknown> = {}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ...(process.env.E2E_COVERAGE
      ? [
          istanbul({
            include: 'src/**',
            exclude: ['node_modules', 'cypress'],
            extension: ['.ts', '.vue'],
            requireEnv: false,
            forceBuildInstrument: true,
            onCover: (filename: string, fileCoverage: unknown) => {
              e2eBaseline[filename] = fileCoverage
            }
          }),
          {
            name: 'e2e-coverage-baseline',
            closeBundle() {
              writeFileSync('coverage-e2e-baseline.json', JSON.stringify(e2eBaseline))
            }
          }
        ]
      : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
