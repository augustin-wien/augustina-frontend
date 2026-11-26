function clickIfPresent(selector: string) {
  cy.get('body').then(($body) => {
    const element = $body.find(selector)

    if (element.length) cy.wrap(element.first()).click({ force: true })
  })
}

describe('Vendor detail pages', () => {
  it('shows the profile and its QR code', () => {
    cy.loginBackoffice('/backoffice/userprofile/1')
    cy.get('h1.page-header-title').should('be.visible')
    cy.contains('button', 'QR').click()
    cy.get('body').type('{esc}')
  })

  it('adds, edits and deletes a comment', () => {
    cy.loginBackoffice('/backoffice/userprofile/1/comments')
    cy.contains('button', 'Kommentar hinzufügen').click()
    cy.get('#comment-text').type('E2E comment')
    cy.contains('button', 'Speichern').click()
    cy.contains('.comment-text', 'E2E comment').should('be.visible')

    cy.contains('.comment-card', 'E2E comment').find('button[title="Bearbeiten"]').click()
    cy.get('#comment-text').type(' edited')
    cy.get('input[type="checkbox"]').check({ force: true })
    cy.contains('button', 'Speichern').click()
    cy.contains('.comment-text', 'E2E comment edited').should('be.visible')

    cy.contains('.comment-card', 'E2E comment edited').find('button[title="Löschen"]').click()
    clickIfPresent('#delete-vendor-comment')
  })

  it('opens the credit payout page', () => {
    cy.loginBackoffice('/backoffice/credits/payout/1')
    cy.get('h1.page-header-title').should('be.visible')
  })

  it('uses the point of sale', () => {
    cy.loginBackoffice('/backoffice/pos/fl-123')
    cy.get('h1.page-header-title').should('be.visible')
    cy.get('.pos-item-stepper button').last().click({ force: true })
    cy.get('.pos-item-stepper button').last().click({ force: true })
    cy.get('.pos-item-stepper button').first().click({ force: true })
    cy.get('.pos-item-qty').first().clear().type('2{enter}')
    clickIfPresent('.pos-balance-toggle input')
    cy.get('.pos-comments-toggle').should('be.visible')

    cy.get('body').then(($body) => {
      if (!$body.find('.pos-comment-add input').length) cy.get('.pos-comments-toggle').click()
    })

    cy.get('.pos-comment-add input').type('POS comment{enter}')
    cy.get('.pos-complete-btn').click({ force: true })
    clickIfPresent('.pos-success button')
  })

  it('opens the vendor update page and its address modal', () => {
    cy.loginBackoffice('/backoffice/userprofile/1/update')
    cy.get('#licenseID').should('be.visible')
    cy.get('#hasSmartphone').scrollIntoView()
    cy.get('#isBlocked').select(1, { force: true })
    cy.get('#isBlocked').select(0, { force: true })
    cy.get('#isDisabled').select(1, { force: true })
    cy.get('#isDisabled').select(0, { force: true })
    cy.get('#bankAccount').select(1, { force: true })
    cy.get('#useOwnEmail').check({ force: true })
    cy.get('#email').clear().type('own@example.com')
    cy.get('#useOwnEmail').uncheck({ force: true })
  })
})
