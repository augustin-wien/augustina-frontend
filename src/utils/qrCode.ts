import QRCodeStyling from 'qr-code-styling'
import JSZip from 'jszip'
import { getBase64ImageFromUrl } from '@/api/api'
import type { Settings } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'
import type {
  DotsOptions,
  BackgroundOptions,
  ImageOptions,
  QrCodeOptions,
  CornerSquareOptions,
  CornersDotOptions
} from '@/models/qrcode'

type QrStyle = {
  dotsOptions?: DotsOptions
  backgroundOptions?: BackgroundOptions
  imageOptions?: ImageOptions
  qrCodeOptions?: QrCodeOptions
  cornerSquareOptions?: CornerSquareOptions
  cornersDotOptions?: CornersDotOptions
}

const defaultStyle: QrStyle = {
  dotsOptions: { color: '#000', type: 'dots', gradient: undefined },
  backgroundOptions: { color: '#fff', gradient: undefined },
  imageOptions: { hideBackgroundDots: false, imageSize: 1, crossOrigin: 'anonymous', margin: 2 },
  qrCodeOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
  cornerSquareOptions: { type: 'dot', color: '#000' },
  cornersDotOptions: { type: 'dot', color: '#000' }
}

// The style configured under settings; falls back to the defaults if it is missing or broken
function qrStyle(settings: Settings): QrStyle {
  if (!settings.QRCodeSettings) return defaultStyle

  try {
    return JSON.parse(settings.QRCodeSettings)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Invalid QRCodeSettings JSON, falling back to defaults', err)

    return defaultStyle
  }
}

// The logo in the middle of the QR code as a data URL, if one is configured
export async function qrLogo(settings: Settings): Promise<string | undefined> {
  if (!settings.QRCodeEnableLogo || !settings.QRCodeLogoImgUrl) return undefined

  return (await getBase64ImageFromUrl(settings.QRCodeLogoImgUrl)) || undefined
}

export function vendorQrCode(vendor: Vendor, settings: Settings, logo?: string): QRCodeStyling {
  const style = qrStyle(settings)

  return new QRCodeStyling({
    width: 500,
    height: 500,
    type: 'svg',
    data: `${settings.QRCodeUrl}/v/${vendor.LicenseID}`,
    image: logo,
    dotsOptions: style.dotsOptions,
    backgroundOptions: style.backgroundOptions,
    imageOptions: style.imageOptions,
    cornersSquareOptions: style.cornerSquareOptions,
    cornersDotOptions: style.cornersDotOptions,
    qrOptions: style.qrCodeOptions
  })
}

// Downloads one zip with a PNG QR code per vendor, named after the license ID
export async function downloadAllQrCodes(
  vendors: Vendor[],
  settings: Settings,
  onProgress?: (done: number) => void
) {
  const logo = await qrLogo(settings)
  const zip = new JSZip()

  for (const [index, vendor] of vendors.entries()) {
    if (!vendor.LicenseID) continue

    const png = await vendorQrCode(vendor, settings, logo).getRawData('png')

    if (png) zip.file(`${vendor.LicenseID}.png`, png as Blob)

    onProgress?.(index + 1)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(blob)
  anchor.download = `qr-codes_${new Date().toISOString().split('T')[0]}.zip`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(anchor.href)
}
