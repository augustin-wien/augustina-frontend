import type { Vendor, VendorComment, VendorLocation, LocationOverview } from '@/stores/vendor'
import type { Item } from '@/stores/items'
import type { Customer, Abonement } from '@/stores/customer'
import type { Campaign } from '@/stores/campaigns'
import type { Order } from '@/stores/orders'
import type { Payment } from '@/stores/payments'

export const vendorLocation = (overrides: Partial<VendorLocation> = {}): VendorLocation => ({
  id: 1,
  name: 'Billa Praterstraße',
  address: 'Praterstraße 1',
  longitude: 16.38,
  latitude: 48.21,
  zip: '1020',
  telephone: '01 1234',
  market_number: '42',
  working_time: {
    mode: 'everyday',
    everyday: [{ from: '08:00', to: '12:00' }],
    whole_week: true
  },
  ...overrides
})

export const vendorComment = (overrides: Partial<VendorComment> = {}): VendorComment => ({
  id: 1,
  vendorid: 1,
  comment: 'Ausweis erneuert',
  warning: false,
  resolved_at: null,
  created_at: new Date('2026-10-01T10:00:00Z'),
  ...overrides
})

export const vendor = (overrides: Partial<Vendor> = {}): Vendor => ({
  ID: 1,
  AccountProofUrl: 'https://example.org/proof.pdf',
  Email: 'anna@example.org',
  HasOwnEmail: true,
  FirstName: 'Anna',
  KeycloakID: 'kc-1',
  LastName: 'Muster',
  LastPayout: '2026-10-01T10:00:00Z',
  LicenseID: 'AUG-1',
  UrlID: 'url-1',
  Balance: 1250,
  IsDisabled: false,
  IsDeleted: false,
  IsBlocked: false,
  BlockedNote: '',
  Language: 'de',
  Comments: [vendorComment({ warning: true, comment: 'Hat Schulden' })],
  Locations: [vendorLocation()],
  Telephone: '0660 123',
  RegistrationDate: '2025-01-15',
  VendorSince: '2020-03-01',
  OnlineMap: true,
  HasSmartphone: true,
  HasBankAccount: false,
  Debt: '10',
  LastOnlineSale: '2026-10-02T10:00:00Z',
  LastIDScan: null,
  OpenPayments: null,
  ...overrides
})

export const vendors = (): Vendor[] => [
  vendor(),
  vendor({
    ID: 2,
    FirstName: 'Bernd',
    LastName: 'Beispiel',
    LicenseID: 'AUG-2',
    Email: 'aug-2@vendor.augustin.or.at',
    HasOwnEmail: false,
    Balance: 0,
    IsBlocked: true,
    BlockedNote: 'Gesperrt',
    Comments: [],
    Locations: [],
    LastPayout: null,
    LastOnlineSale: null
  }),
  vendor({
    ID: 3,
    FirstName: 'Carla',
    LastName: 'Dritte',
    LicenseID: 'AUG-3',
    IsDisabled: true,
    Balance: -300
  })
]

export const locationOverview = (overrides: Partial<LocationOverview> = {}): LocationOverview => ({
  id: 1,
  name: 'Billa Praterstraße',
  address: 'Praterstraße 1',
  zip: '1020',
  telephone: '01 1234',
  market_number: '42',
  longitude: 16.38,
  latitude: 48.21,
  working_time: { mode: 'everyday', everyday: [{ from: '08:00', to: '12:00' }] },
  vendorID: 1,
  vendorLicenseID: 'AUG-1',
  vendorFirstName: 'Anna',
  vendorLastName: 'Muster',
  vendorTelephone: '0660 123',
  vendorIsDisabled: false,
  vendorIsBlocked: false,
  ...overrides
})

export const item = (overrides: Partial<Record<keyof Item, unknown>> = {}): Item =>
  ({
    Description: 'Die aktuelle Ausgabe',
    ID: 1,
    Image: '/img/zeitung.png',
    Name: 'Zeitung',
    Price: 400,
    Disabled: false,
    Archived: false,
    IsLicenseItem: false,
    LicenseItem: null,
    LicenseGroup: null,
    IsPDFItem: false,
    PDF: null,
    ItemColor: '#ff0000',
    ItemOrder: 1,
    ItemTextColor: '#ffffff',
    Type: 'issue',
    ...overrides
  }) as Item

export const items = (): Item[] => [
  item(),
  item({ ID: 2, Name: 'Spende', Type: 'donation', Price: 0, ItemOrder: 9 }),
  item({ ID: 3, Name: 'Transaktionskosten', Type: 'transaction_costs', Price: 30 }),
  item({
    ID: 4,
    Name: 'Digitale Ausgabe',
    Type: 'online_issue',
    Price: 300,
    LicenseGroup: 'digital_edition',
    LicenseItem: 5,
    ItemOrder: 2
  }),
  item({
    ID: 5,
    Name: 'Lizenz',
    Type: 'license_item',
    IsLicenseItem: true,
    LicenseGroup: 'digital_edition',
    Price: 0
  }),
  item({ ID: 6, Name: 'Kalender', Type: 'normal_item', Price: 1000, ItemOrder: 3 }),
  item({ ID: 7, Name: 'Abo', Type: 'abonement', Price: 3000, AboDurationMonths: 12 })
]

export const settings = () => ({
  ID: 1,
  AGBUrl: 'https://example.org/agb',
  Color: '#d50000',
  FontColor: '#ffffff',
  Favicon: '/img/favicon.png',
  Logo: '/img/logo.png',
  MainItem: 1,
  MainItemDescription: 'Die aktuelle Ausgabe',
  MainItemImage: '/img/zeitung.png',
  MainItemName: 'Zeitung',
  MainItemPrice: 400,
  MaintainanceModeHelpUrl: 'https://example.org/help',
  MaxOrderAmount: 5000,
  NewspaperName: 'Augustin',
  OrgaCoversTransactionCosts: false,
  QRCodeLogoImgUrl: '',
  QRCodeUrl: 'https://example.org',
  QRCodeSettings: '',
  QRCodeEnableLogo: false,
  VendorNotFoundHelpUrl: 'https://example.org/vendor',
  VendorEmailPostfix: '@vendor.augustin.or.at',
  WebshopIsClosed: false,
  MapCenterLat: 48.2,
  MapCenterLong: 16.37,
  UseVendorLicenseIdInShop: false,
  UseTipInsteadOfDonation: false,
  ShopLanding: true,
  DigitalItemsUrl: 'https://example.org/digital',
  AbonementUrl: 'https://example.org/abo',
  AbonementEnabled: true,
  VoucherEnabled: true,
  POSEnabled: true,
  DonationTrackingEnabled: true,
  OdooEnabled: false,
  WordPressInviteURL: '',
  WordPressInviteAPIKey: '',
  WordPressInviteTTL: 7,
  PrivacyPolicyUrl: 'https://example.org/privacy',
  MatomoUrl: '',
  MatomoSiteId: '',
  OnlinePaperUrl: 'https://example.org/paper',
  MailSenderName: 'Augustin',
  AGBRequired: true,
  DonationPageEnabled: true,
  MatomoTrackCart: false,
  FeedbackEnabled: true,
  FeedbackEmail: 'feedback@example.org',
  NewsletterEnabled: true,
  IDScanEnabled: true,
  NextcloudEnabled: true,
  SteckbriefEnabled: true,
  NextcloudConfigured: true,
  NextcloudURL: 'https://cloud.example.org',
  NextcloudPublicURL: 'https://cloud.example.org',
  NextcloudUsername: 'bot',
  NextcloudAppPassword: '',
  NextcloudVendorRoot: '/Verkäufer',
  OdooWebhookURL: '',
  OdooWebhookToken: '',
  OdooDBFilter: '',
  AccountingReportEmail: 'buchhaltung@example.org',
  SalesAnonymizationEnabled: false,
  VendorAnonymizationEnabled: false,
  Keycloak: { URL: 'https://sso.example.org', Realm: 'augustin' }
})

const mainItem = {
  id: 1,
  Description: 'Die aktuelle Ausgabe',
  Image: '/img/zeitung.png',
  Name: 'Zeitung',
  Price: 400
}

/** The settings endpoints wrap the settings together with the main item and the keycloak config. */
export const settingsResponse = () => {
  const { Keycloak, ...rest } = settings()

  return {
    Settings: { ...rest, Edges: { MainItem: mainItem }, edges: { MainItem: mainItem } },
    Keycloak,
    SecretsSet: { NextcloudAppPassword: true }
  }
}

export const customer = (overrides: Partial<Customer> = {}): Customer => ({
  id: 1,
  keycloakid: 'kc-c1',
  email: 'kunde@example.org',
  firstname: 'Karl',
  lastname: 'Kunde',
  licensegroups: ['digital_edition'],
  newsletter: true,
  newsletter_at: '2026-01-01T00:00:00Z',
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  purchase_count: 3,
  last_purchase_at: '2026-10-01T00:00:00Z',
  ...overrides
})

export const abonement = (overrides: Partial<Abonement> = {}): Abonement => ({
  id: 1,
  customer_id: 1,
  item_id: 7,
  from_date: '2026-01-01',
  to_date: '2026-12-31',
  status: 'active',
  ...overrides
})

export const campaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  id: 1,
  name: 'Weihnachten',
  item_id: 6,
  title: 'Der Kalender ist da',
  text: 'Jetzt kaufen',
  starts_at: '2026-01-01T00:00:00Z',
  ends_at: '2099-01-01T00:00:00Z',
  enabled: true,
  views: 100,
  clicks: 7,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides
})

export const order = (overrides: Partial<Order> = {}): Order => ({
  ID: 1,
  OrderCode: '1234567890',
  TransactionID: 'txn-1',
  Timestamp: '2026-10-01T10:00:00Z',
  VerifiedAt: null,
  Vendor: 1,
  CustomerEmail: 'kunde@example.org',
  OdooSyncedAt: null,
  OdooSyncError: null,
  Entries: [
    {
      ID: 1,
      Item: 1,
      Quantity: 2,
      Price: 400,
      Sender: 10,
      Receiver: 1,
      SenderName: 'Cash',
      ReceiverName: 'AUG-1',
      IsSale: true
    }
  ],
  ...overrides
})

export const payment = (overrides: Partial<Payment> = {}): Payment =>
  ({
    Amount: 800,
    AuthorizedBy: 'admin',
    ID: 1,
    Order: 1,
    OrderEntry: 1,
    Receiver: 1,
    ReceiverName: 'AUG-1',
    Sender: 10,
    SenderName: 'Cash',
    Timestamp: '2026-10-01T10:00:00Z',
    Item: 1,
    Quantity: 2,
    Price: 400,
    Payout: false,
    IsPayoutFor: [],
    ...overrides
  }) as unknown as Payment

export const statistics = () => ({
  ID: 0,
  Name: 'Gesamt',
  SumAmount: 12000,
  SumQuantity: 30,
  Items: [
    { ID: 1, Name: 'Zeitung', Type: 'issue', SumAmount: 8000, SumQuantity: 20 },
    { ID: 2, Name: 'Spende', Type: 'donation', SumAmount: 3000, SumQuantity: 5 },
    {
      ID: 3,
      Name: 'Transaktionskosten',
      Type: 'transaction_costs',
      SumAmount: 1000,
      SumQuantity: 5
    }
  ],
  Days: [
    { Date: '2026-10-01', ItemID: 1, SumAmount: 4000, SumQuantity: 10 },
    { Date: '2026-10-02', ItemID: 1, SumAmount: 4000, SumQuantity: 10 },
    { Date: '2026-10-02', ItemID: 2, SumAmount: 3000, SumQuantity: 5 }
  ],
  Payouts: [{ Date: '2026-10-02', Count: 1, SumAmount: 2000 }],
  TopVendors: [
    { VendorID: 1, LicenseID: 'AUG-1', Name: 'Anna Muster', SumAmount: 8000, SumQuantity: 20 }
  ],
  TopVendorsByAmount: [
    { VendorID: 1, LicenseID: 'AUG-1', Name: 'Anna Muster', SumAmount: 8000, SumQuantity: 20 }
  ]
})
