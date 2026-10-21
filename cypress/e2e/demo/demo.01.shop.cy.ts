const licenseId = Cypress.env('vendorLicenseId') || 'fl-123'

describe('Demo shop', () => {
  beforeEach(() => {
    // Keep the campaign popup out of the flow and the test runs out of the campaign statistics
    cy.intercept('GET', '**/api/campaigns/active/', { body: [] })
  })

  it('rejects an unknown vendor id', () => {
    cy.visit('/v/does-not-exist-e2e')
    cy.contains('Die gescannte ID ist nicht gültig')
  })

  it('shows the landing page for a valid vendor', () => {
    cy.visit('/v/' + licenseId)
    cy.contains('#title', 'Zeitung kaufen bei')
    cy.get('#vendor-name').invoke('text').should('not.be.empty')
    cy.get('#main-item-name').should('contain', '1x')

    cy.get('#price')
      .invoke('text')
      .should('match', /\d+\.\d{2}€/)
  })

  it('orders the main item and is sent to the VivaWallet checkout', () => {
    cy.intercept('POST', '**/api/orders/').as('postOrder')

    cy.visit('/v/' + licenseId)

    cy.get('#price')
      .invoke('text')
      .should('match', /\d+\.\d{2}€/)

    cy.get('#next-btn').click()

    cy.contains('button', 'Heute nicht').click()

    cy.get('#final-price')
      .invoke('text')
      .should('match', /\d+\.\d{2}€/)

    // Without accepting the terms the order must not be sent
    cy.get('#confirmation-page #next-btn').click()
    cy.url().should('include', '/confirmation')

    cy.get('#checkbox').check()
    cy.get('#confirmation-page #next-btn').click()

    cy.wait('@postOrder').then(({ request, response }) => {
      expect(request.body.vendorLicenseID).to.eq(licenseId)
      expect(request.body.entries).to.have.length.greaterThan(0)
      expect(request.body.entries[0].quantity).to.eq(1)

      expect(response?.statusCode).to.eq(200)
      const checkoutUrl = new URL(response?.body.SmartCheckoutURL)
      expect(checkoutUrl.origin).to.eq('https://demo.vivapayments.com')
      expect(checkoutUrl.searchParams.get('ref')).to.match(/^\d+$/)

      // VivaWallet's own page blocks automated browsers, so only the redirect itself is checked
      cy.origin(
        'https://demo.vivapayments.com',
        { args: { ref: checkoutUrl.searchParams.get('ref') } },
        ({ ref }) => {
          cy.location('search', { timeout: 30000 }).should('include', 'ref=' + ref)
        }
      )
    })
  })
})
