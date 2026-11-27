import { vi } from 'vitest'

// jsdom has no modal dialogs; components open and close their <dialog> elements on mount
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
  }
}

// chart.js, qr-code-styling and leaflet draw on canvas or need a real layout engine
vi.mock('chart.js/auto', () => {
  const Chart = vi.fn(function (_canvas: unknown, config: unknown) {
    return {
      config,
      destroy: vi.fn(),
      update: vi.fn(),
      toBase64Image: vi.fn(() => 'data:image/png;base64,'),
      data: (config as { data?: unknown })?.data ?? {},
      options: (config as { options?: unknown })?.options ?? {}
    }
  })

  return { default: Object.assign(Chart, { getChart: vi.fn(() => undefined) }) }
})

vi.mock('qr-code-styling', () => ({
  default: vi.fn(function () {
    return {
      append: vi.fn(),
      update: vi.fn(),
      download: vi.fn(),
      getRawData: vi.fn(async () => new Blob(['png']))
    }
  })
}))

vi.mock('@vue-leaflet/vue-leaflet', async () => (await import('./leaflet')).leafletStubs())
vi.mock('vue-leaflet-markercluster', async () => (await import('./leaflet')).leafletStubs())
