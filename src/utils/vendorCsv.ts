import type { VendorLocation } from '@/stores/vendor'
import { transformToFloat } from '@/utils/utils'
import { normalizeWorkingTime } from '@/utils/workingTime'
import sampleCsv from '../../Vendor_import.csv?raw'

/**
 * Column order expected in the vendor import CSV (semicolon separated, first line is the header).
 * See Vendor_import.csv in the repository root for a sample file.
 */
export const VENDOR_CSV_COLUMNS = [
  'PLZ',
  'Station/Supermarkt',
  'Adresse',
  'Longitude',
  'Latitude',
  'Arbeitszeit',
  'Ausweis Nr.',
  'Vorname',
  'Nachname',
  'Nummer',
  'Sprache',
  'Registrierungsdatum',
  'VerkäuferIn seit',
  'Kommentar',
  'Auf die Karte?',
  'Hat ein Smartphone?',
  'Hat ein Konto',
  'Schulden'
] as const

/** A single vendor as parsed from the import CSV. */
export interface VendorCsvRow {
  PLZ: string
  Location: string
  Address: string
  Longitude: number
  Latitude: number
  WorkingTime: string
  LicenseID: string
  FirstName: string
  LastName: string
  Telephone: string
  Language: string
  RegistrationDate: string
  VendorSince: string
  Comment: string
  LastPayout: null
  UrlID: string
  OnlineMap: boolean
  HasSmartphone: boolean
  HasBankAccount: boolean
  IsDisabled: boolean
  Email: string
  Debt: string
}

/**
 * The Standplatz columns describe a location, which the backend stores separately from the vendor —
 * the vendor payload has no address fields. A row only gets a location when it names one.
 */
export function hasLocation(vendor: VendorCsvRow): boolean {
  return vendor.Location !== '' || vendor.Address !== '' || vendor.PLZ !== ''
}

export function buildLocation(vendor: VendorCsvRow): VendorLocation {
  return {
    id: 0,
    name: vendor.Location,
    address: vendor.Address,
    zip: vendor.PLZ,
    longitude: vendor.Longitude,
    latitude: vendor.Latitude,
    working_time: normalizeWorkingTime(vendor.WorkingTime)
  }
}

/** Comments are a separate resource as well, and only rows that carry one get it. */
export function buildComment(vendor: VendorCsvRow): { comment: string; warning: boolean } {
  return { comment: vendor.Comment, warning: false }
}

export const VENDOR_CSV_TEMPLATE_FILENAME = 'Vendor_import.csv'

/** Excel only reads the umlauts correctly when the file starts with a UTF-8 BOM. */
const UTF8_BOM = '\ufeff'

/**
 * The sample file shipped with the frontend, ready to be handed to a backoffice user.
 * It is the same file the parser tests run against, so what gets downloaded always imports.
 */
export function buildVendorCsvTemplate(): string {
  return `${UTF8_BOM}${sampleCsv}`
}

/** Offers the sample file as a download. */
export function downloadVendorCsvTemplate(): void {
  const anchor = document.createElement('a')
  anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(buildVendorCsvTemplate())
  anchor.target = '_blank'
  anchor.style.visibility = 'hidden'
  anchor.download = VENDOR_CSV_TEMPLATE_FILENAME
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

const isYes = (value: string): boolean => {
  const normalized = value.toLowerCase()
  return normalized === 'ja' || normalized === 'yes'
}

/**
 * Parses the vendor import CSV into vendors ready to be sent to the backend.
 *
 * The first line is treated as a header and skipped. Blank lines are ignored, so a file with a
 * trailing newline does not produce an empty vendor. Rows without a license id are dropped as
 * well — the store aborts the whole import when it hits a vendor without one.
 */
export function parseVendorsCsv(text: string, emailPostfix: string): VendorCsvRow[] {
  return text
    .split('\n')
    .slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const [
        PLZ,
        Location,
        Address,
        Longitude,
        Latitude,
        WorkingTime,
        LicenseID,
        FirstName,
        LastName,
        Telephone,
        Language,
        RegistrationDate,
        VendorSince,
        Comment,
        OnlineMap,
        HasSmartphone,
        HasBankAccount,
        Debt
      ] = line.split(';').map((field) => field.trim())

      return {
        PLZ: PLZ ?? '',
        Location: Location ?? '',
        Address: Address ?? '',
        Longitude: !Longitude ? 0.1 : transformToFloat(Longitude),
        Latitude: !Latitude ? 0.1 : transformToFloat(Latitude),
        WorkingTime: !WorkingTime ? 'G' : WorkingTime,
        LicenseID: LicenseID ?? '',
        FirstName: FirstName ?? '',
        LastName: LastName ?? '',
        Telephone: Telephone ?? '',
        Language: Language ?? '',
        RegistrationDate: RegistrationDate ?? '',
        VendorSince: VendorSince ?? '',
        Comment: Comment ?? '',
        LastPayout: null,
        UrlID: '',
        OnlineMap: isYes(OnlineMap ?? ''),
        HasSmartphone: isYes(HasSmartphone ?? ''),
        HasBankAccount: isYes(HasBankAccount ?? ''),
        IsDisabled: false,
        Email: `${LicenseID ?? ''}${emailPostfix}`,
        Debt: Debt ?? ''
      }
    })
    .filter((vendor) => vendor.LicenseID !== '')
}
