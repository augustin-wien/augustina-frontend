describe('Vendor self service', () => {
  it('shows the balance and the QR code of the logged in vendor', () => {
    cy.loginVendor('/me')
    cy.get('.vendor-overview').should('be.visible')
    cy.get('.vendor-overview .font-bold').should('exist')
  })

  it('opens the profile and returns to the overview', () => {
    cy.loginVendor('/me')
    cy.get('.vendor-overview').should('be.visible')
    cy.contains('button', 'Profil').click()
    cy.url().should('include', '/me/profile')
    cy.get('button').first().click()
    cy.url().should('match', /\/me\/?$/)
  })

  it('opens the QR code page', () => {
    cy.loginVendor('/me/qrcode')
    cy.contains('h1', 'QR-Code').should('be.visible')
    cy.get('#canvas').should('exist')
    cy.get('button').last().click()
    cy.url().should('match', /\/me\/?$/)
  })

  it('logs the vendor out', () => {
    cy.loginVendor('/me')
    cy.get('.vendor-overview').should('be.visible')
    cy.get('.vendor-overview button').last().click()
    cy.url().should('not.include', '/me')
  })

  it('keeps a vendor out of the backoffice', () => {
    cy.loginVendor('/backoffice/vendorsummary')
    cy.url().should('not.include', '/backoffice/vendorsummary')
  })
})

describe('Vendor info in the backoffice', () => {
  it('opens and closes the vendor info from the vendor list', () => {
    cy.loginBackoffice('/backoffice/vendorsummary')
    cy.get('#searchInput').type('fl-123')
    cy.get('tbody tr').should('have.length', 1)
    cy.get('tbody tr button[aria-label="Profil ansehen"]').click()
    cy.get('.aug-modal:visible').should('be.visible')
    cy.get('.aug-modal:visible').contains('fl-123')
    cy.get('.aug-modal:visible').contains('button', 'Bearbeiten').should('exist')
    cy.get('.aug-modal:visible button[aria-label="Close"]').click()
  })

  it('shows a vendor from the map', () => {
    cy.loginBackoffice('/backoffice/map')
    cy.get('.leaflet-marker-icon').should('have.length.gte', 1)
    cy.get('.leaflet-marker-icon').first().click({ force: true })
    cy.get('.leaflet-popup').should('exist')
    cy.get('.leaflet-popup').then(($popup) => {
      const info = $popup.find('button:contains("Info")')

      if (info.length) cy.wrap(info.first()).click({ force: true })
    })
  })
})
