const base = '/v/fl-123'

function dismissCampaign() {
  cy.get('body').then(($body) => {
    const button = $body.find('button:contains("Nein, danke")')

    if (button.length) cy.wrap(button).first().click()
  })
}

function closeCampaign() {
  cy.contains('button', 'Nein, danke').click()
}

describe('Shop pages of a vendor', () => {
  it('opens the check page for unknown and known ids', () => {
    cy.visit('/v/unknown-id')
    cy.visit('/v/fl-123/check-id')
    cy.visit('/go-to-vendor')
  })

  it('opens every step of the purchase', () => {
    ;['landing-page', 'additionalproducts', 'print-digital', 'tipping', 'information', 'confirmation', 'payment', 'item-available', 'items'].forEach((step) => {
      cy.visit(`${base}/${step}`)
      cy.get('#app').should('exist')
      dismissCampaign()
    })
  })

  it('changes the amount of the custom tip', () => {
    cy.visit(`${base}/landing-page`)
    closeCampaign()
    cy.get('#next-btn').should('be.visible').click()
    cy.contains('button', 'Anderer Betrag').click({ force: true })
    cy.get('#increment-btn').click()
    cy.get('#increment-btn').click()
    cy.get('#decrement-btn').click()
    cy.get('#donation-input-wrapper input').clear().type('7')
    cy.get('#next-button').click({ force: true })
  })

  it('selects items in the shop', () => {
    cy.visit(`${base}/landing-page`)
    closeCampaign()
    cy.get('#landing-page-shop').click()
    cy.get('#shop-page').should('be.visible')
    cy.get('#items-list').find('button').first().click({ force: true })
  })

  it('picks a fixed tip', () => {
    cy.visit(`${base}/landing-page`)
    closeCampaign()
    cy.get('#next-btn').should('be.visible').click()
    cy.url().should('include', '/tipping')
    cy.contains('button', '2,00').click({ force: true })
  })

  it('opens the print and digital choice', () => {
    cy.visit(`${base}/landing-page`)
    closeCampaign()
    cy.contains('button', 'Weiter').click({ force: true })
    cy.url().should('include', 'fl-123')
  })
})
