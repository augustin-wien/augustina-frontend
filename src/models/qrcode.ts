import { type DotType, type Gradient, type TypeNumber } from 'qr-code-styling'

export interface DotsOptions {
  color: string
  type: DotType
  gradient: Gradient | undefined
}

export interface BackgroundOptions {
  color: string
  gradient: Gradient | undefined
}

export interface ImageOptions {
  hideBackgroundDots: boolean
  imageSize: number
  crossOrigin?: string
  margin: number
}
export interface QrCodeOptions {
  typeNumber: TypeNumber
  mode: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}
export interface CornerSquareOptions {
  type: 'square' | 'dot'
  color: string
}

export interface CornersDotOptions {
  type: 'square' | 'dot'
  color: string
}
