import Chart from 'chart.js/auto'

// Lower-case ASCII file name part, e.g. "Einnahmen pro Tag" -> "einnahmen_pro_tag"
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const chartPngFilename = (title: string, range: string) =>
  `statistik_${slugify(title)}_${slugify(range)}.png`

const tokenColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Draws title, period and the chart (as currently rendered, legend included) onto one
// image on the card background, so text colors match the theme the chart was drawn in.
export const exportChartPng = (chartCanvas: HTMLCanvasElement, title: string, range: string) => {
  // Render the final state (no animation frame) at print resolution, then restore
  const chart = Chart.getChart(chartCanvas)
  const previousRatio = chart?.options.devicePixelRatio

  if (chart) {
    chart.stop()
    chart.options.devicePixelRatio = Math.max(2, window.devicePixelRatio)
    chart.resize()
    chart.update('none')
  }

  try {
    drawPng(chartCanvas, title, range)
  } finally {
    if (chart) {
      chart.options.devicePixelRatio = previousRatio
      chart.resize()
      chart.update('none')
    }
  }
}

const drawPng = (chartCanvas: HTMLCanvasElement, title: string, range: string) => {
  const scale = chartCanvas.width / chartCanvas.clientWidth || 1
  const padding = 24 * scale
  const titleSize = 18 * scale
  const rangeSize = 13 * scale
  const header = titleSize + rangeSize + 12 * scale

  const canvas = document.createElement('canvas')
  canvas.width = chartCanvas.width + padding * 2
  canvas.height = chartCanvas.height + header + padding * 2 + 12 * scale
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  const font = getComputedStyle(document.body).fontFamily
  ctx.fillStyle = tokenColor('--color-surface') || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textBaseline = 'top'
  ctx.fillStyle = tokenColor('--color-text') || '#1a1d23'
  ctx.font = `700 ${titleSize}px ${font}`
  ctx.fillText(title, padding, padding)
  ctx.fillStyle = tokenColor('--color-text-muted') || '#6b7280'
  ctx.font = `400 ${rangeSize}px ${font}`
  ctx.fillText(range, padding, padding + titleSize + 6 * scale)

  ctx.drawImage(chartCanvas, padding, padding + header + 12 * scale)

  const link = document.createElement('a')
  link.download = chartPngFilename(title, range)
  link.href = canvas.toDataURL('image/png')
  link.click()
}
