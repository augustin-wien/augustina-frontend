/**
 * The license ID from a scanned vendor ID card. The QR code holds the vendor's shop link
 * (QRCodeUrl + "/v/" + license ID, see vendorQrCode); anything else is taken as a license ID
 * typed in by hand.
 */
export function licenseIdFromScan(text: string): string {
  const scanned = (text ?? '').trim()
  const segment = scanned.match(/.*\/v\/([^/?#]+)/)?.[1]
  if (!segment) return scanned

  try {
    return decodeURIComponent(segment).trim()
  } catch {
    return segment.trim()
  }
}
