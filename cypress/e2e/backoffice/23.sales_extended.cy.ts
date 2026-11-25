const items = [
  { ID: 1, Name: 'Zeitung', Type: 'normal_item', Price: 300, IsLicenseItem: false, LicenseItem: null },
  { ID: 2, Name: 'Spende', Type: 'donation', Price: 0, IsLicenseItem: false, LicenseItem: null },
  { ID: 3, Name: 'Online Ausgabe', Type: 'online_issue', Price: 300, IsLicenseItem: false, LicenseItem: 4 },
  { ID: 4, Name: 'Lizenz', Type: 'license_item', Price: 0, IsLicenseItem: true, LicenseItem: null }
].map((item) => ({
  Description: '',
  Image: '',
  Disabled: false,
  Archived: false,
  IsPDFItem: false,
  ItemOrder: 0,
  LicenseGroup: '',
  ...item
}))

const entry = (id: number, item: number, quantity: number, price: number, isSale = true) => ({
  ID: id,
  Item: item,
  Quantity: quantity,
  Price: price,
  Sender: 1,
  Receiver: 3,
  SenderName: 'Kunde',
  ReceiverName: 'fl-123',
  IsSale: isSale
})

const orders = [
  {
    ID: 1,
    OrderCode: '1111',
    TransactionID: 'tx-1',
    Timestamp: '2026-11-24T10:00:00Z',
    VerifiedAt: '2026-11-24T10:01:00Z',
    Vendor: 3,
    CustomerEmail: 'one@example.com',
    OdooSyncedAt: '2026-11-24T10:02:00Z',
    OdooSyncError: null,
    Entries: [entry(1, 1, 2, 300), entry(2, 2, 1, 150), entry(3, 3, 1, 300), entry(4, 4, 1, 0, false)]
  },
  {
    ID: 2,
    OrderCode: null,
    TransactionID: '',
    Timestamp: '2026-11-24T11:00:00Z',
    VerifiedAt: null,
    Vendor: 3,
    CustomerEmail: null,
    OdooSyncedAt: null,
    OdooSyncError: 'Timeout',
    Entries: [entry(5, 1, 1, 300)]
  },
  {
    ID: 3,
    OrderCode: '3333',
    TransactionID: 'tx-3',
    Timestamp: '2026-11-24T12:00:00Z',
    VerifiedAt: '2026-11-24T12:01:00Z',
    Vendor: 3,
    CustomerEmail: 'three@example.com',
    OdooSyncedAt: null,
    OdooSyncError: null,
    Entries: null
  }
]

function stubSales() {
  cy.intercept('GET', '**/api/settings/', (req) => {
    req.continue((res) => {
      res.body.OdooEnabled = true
    })
  })
  cy.intercept('GET', '**/api/items/backoffice*', { statusCode: 200, body: items })
  cy.intercept('GET', '**/api/items/?*', { statusCode: 200, body: items })
  cy.intercept('GET', '**/api/orders/verified/*', { statusCode: 200, body: orders }).as('orders')
  cy.intercept('POST', '**/api/orders/*/resend-mail/', { statusCode: 200, body: {} }).as('resendMail')
  cy.intercept('POST', '**/api/orders/resend/*', { statusCode: 200, body: { sent_at: '2026-11-25T10:00:00Z' } }).as('resendOdoo')
}

describe('Extended sales', () => {
  it('lists, searches and exports the sales', () => {
    stubSales()
    cy.loginBackoffice('/backoffice/sales-extended')
    cy.wait('@orders')
    cy.get('tbody tr').should('have.length.gte', 3)
    cy.get('input[type="search"], input[type="text"]').first().type('one@example')
    cy.get('tbody tr').should('have.length.gte', 1)
    cy.get('input[type="search"], input[type="text"]').first().clear().type('nichts-passt')
    cy.get('input[type="search"], input[type="text"]').first().clear()
    cy.get('input[type="search"], input[type="text"]').first().type('Online')
    cy.get('input[type="search"], input[type="text"]').first().clear()
    cy.contains('button', 'Exportieren').click()
  })

  it('resends the mail and the Odoo webhook of a sale', () => {
    stubSales()
    cy.loginBackoffice('/backoffice/sales-extended')
    cy.wait('@orders')
    cy.get('tbody tr').should('have.length.gte', 3)
    cy.window().then((win) => cy.stub(win, 'confirm').returns(true))
    cy.get('tbody button').then(($buttons) => {
      expect($buttons.length).to.be.gte(1)
    })
    cy.get('tbody button').first().click({ force: true })
    cy.get('tbody button').last().click({ force: true })
    cy.get('.toast').should('be.visible')
  })

  it('shows an error when resending fails', () => {
    stubSales()
    cy.intercept('POST', '**/api/orders/*/resend-mail/', { statusCode: 500, body: {} })
    cy.intercept('POST', '**/api/orders/resend/*', { statusCode: 500, body: 'kaputt' })
    cy.loginBackoffice('/backoffice/sales-extended')
    cy.get('tbody tr').should('have.length.gte', 3)
    cy.window().then((win) => cy.stub(win, 'confirm').returns(true))
    cy.get('tbody button').first().click({ force: true })
    cy.get('.toast').should('be.visible')
    cy.get('tbody button').last().click({ force: true })
  })
})
