const vendor = 'fl-123'

function setShopLanding(enabled: boolean) {
  cy.intercept('GET', '**/api/settings/', (req) => {
    req.continue((res) => {
      res.body.Settings.ShopLanding = enabled
    })
  })
}

describe('Start page of a vendor link', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/vendors/check/*/').as('vendorCheck')
  })

  it('opens the shop with the vendor id when the shop is the start page', () => {
    setShopLanding(true)

    cy.visit(`/v/${vendor}`)

    cy.location('pathname').should('eq', `/v/${vendor}/shop`)
    cy.wait('@vendorCheck').its('request.url').should('include', `/vendors/check/${vendor}/`)
    cy.get('#shop-page').should('be.visible')
    cy.location('pathname').should('eq', `/v/${vendor}/shop`)
  })

  it('keeps the vendor id when the landing page is opened directly', () => {
    setShopLanding(true)

    cy.visit(`/v/${vendor}/landing-page`)

    cy.location('pathname').should('eq', `/v/${vendor}/shop`)
    cy.wait('@vendorCheck').its('request.url').should('include', `/vendors/check/${vendor}/`)
  })

  it('opens the landing page when the shop is not the start page', () => {
    setShopLanding(false)

    cy.visit(`/v/${vendor}`)

    cy.location('pathname').should('eq', `/v/${vendor}/landing-page`)
    cy.wait('@vendorCheck').its('request.url').should('include', `/vendors/check/${vendor}/`)
    cy.contains('div', 'Zeitung kaufen bei').should('be.visible')
    cy.location('pathname').should('eq', `/v/${vendor}/landing-page`)
  })
})
