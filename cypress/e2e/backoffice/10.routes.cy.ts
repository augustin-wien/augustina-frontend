const routes = [
  '/backoffice/vendorsummary',
  '/backoffice/scan-id',
  '/backoffice/locations',
  '/backoffice/map',
  '/backoffice/credits',
  '/backoffice/customers',
  '/backoffice/pos',
  '/backoffice/pos-accounting',
  '/backoffice/payments',
  '/backoffice/sales',
  '/backoffice/sales-extended',
  '/backoffice/payouts',
  '/backoffice/monthly-report',
  '/backoffice/mails',
  '/backoffice/unverified-orders',
  '/backoffice/vouchers',
  '/backoffice/donations',
  '/backoffice/campaigns',
  '/backoffice/statistics',
  '/backoffice/productsettings',
  '/backoffice/newproduct',
  '/backoffice/newvendor'
]

describe('Backoffice pages', () => {
  it('opens every page without a page error', () => {
    cy.loginBackoffice('/backoffice/vendorsummary')
    cy.get('h1.page-header-title').should('be.visible')

    routes.forEach((route) => {
      cy.visit(route)
      cy.get('h1.page-header-title', { timeout: 10000 }).should('be.visible')
      cy.url().should('include', route)
    })
  })
})
