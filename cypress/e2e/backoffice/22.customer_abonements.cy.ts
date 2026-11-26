const customer = {
  id: 501,
  keycloakid: 'kc-501',
  email: 'stub@example.com',
  firstname: 'Stub',
  lastname: 'Kundin',
  licensegroups: ['digital_edition'],
  newsletter: true,
  newsletter_at: '2026-01-01T10:00:00Z'
}

const abonements = [
  {
    id: 1,
    customer_id: 501,
    item_id: 700,
    from_date: '2026-01-01T00:00:00Z',
    to_date: '2026-12-31T00:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    customer_id: 501,
    item_id: 700,
    from_date: '2025-01-01T00:00:00Z',
    to_date: '2025-12-31T00:00:00Z',
    status: 'cancelled'
  },
  {
    id: 3,
    customer_id: 501,
    item_id: 700,
    from_date: '2024-01-01T00:00:00Z',
    to_date: '2024-12-31T00:00:00Z',
    status: 'expired'
  }
]

const abonementItem = {
  ID: 700,
  Name: 'Stub Jahresabo',
  Type: 'abonement',
  Description: '',
  Image: '',
  Price: 5000,
  Disabled: false,
  Archived: false,
  IsLicenseItem: false,
  IsPDFItem: false,
  ItemOrder: 0,
  LicenseGroup: 'digital_edition',
  LicenseItem: null
}

function stubBackend() {
  cy.intercept('GET', '**/api/items/backoffice*', { statusCode: 200, body: [abonementItem] })

  cy.intercept('GET', '**/api/items/licensegroups/', {
    statusCode: 200,
    body: ['digital_edition', 'analog_edition', 'extra_group']
  })

  cy.intercept('GET', '**/api/customers/501/', { statusCode: 200, body: customer })
  cy.intercept('GET', '**/api/customers/501/abonements/', { statusCode: 200, body: abonements })

  cy.intercept('PUT', '**/api/customers/501/', { statusCode: 200, body: customer }).as(
    'saveCustomer'
  )

  cy.intercept('DELETE', '**/api/customers/501/', { statusCode: 204, body: '' }).as(
    'deleteCustomer'
  )

  cy.intercept('POST', '**/api/customers/501/password-reset-email/', {
    statusCode: 200,
    body: {}
  }).as('reset')

  cy.intercept('POST', '**/api/customers/501/verify-email/', { statusCode: 200, body: {} }).as(
    'verify'
  )

  cy.intercept('POST', '**/api/abonements/', { statusCode: 200, body: abonements[0] }).as(
    'createAbonement'
  )

  cy.intercept('PUT', '**/api/abonements/*/', { statusCode: 200, body: abonements[0] }).as(
    'updateAbonement'
  )

  cy.intercept('DELETE', '**/api/abonements/*/', { statusCode: 204, body: '' }).as(
    'deleteAbonement'
  )
}

function openCustomer() {
  stubBackend()
  cy.loginBackoffice('/backoffice/customers/501')
  cy.get('#firstname').should('have.value', 'Stub')
}

describe('Customer detail', () => {
  it('edits the customer and its license groups', () => {
    openCustomer()
    cy.get('#lastname').clear().type('Neu')
    cy.get('#newsletter').uncheck({ force: true })
    cy.get('.license-chips').should('contain', 'digital_edition')
    cy.get('.license-add-row select').select('extra_group')
    cy.get('.license-add-row button').click()
    cy.get('.license-chips').should('contain', 'extra_group')
    cy.get('.license-chip-remove').first().click()
    cy.get('.license-chips').should('not.contain', 'digital_edition')
    cy.contains('button', 'Speichern').click()
    cy.wait('@saveCustomer')
    cy.get('.toast').should('be.visible')
  })

  it('sends the account mails', () => {
    openCustomer()

    cy.get('.field-span-2 button')
      .filter(':visible')
      .then(($buttons) => {
        expect($buttons.length).to.be.gte(1)
      })

    cy.contains('button', 'Passwort-Reset-E-Mail senden').click({ force: true })
    cy.wait('@reset')
    cy.contains('button', 'Verifizierungs-E-Mail senden').click({ force: true })
    cy.wait('@verify')
  })

  it('creates, edits and deletes an abonement', () => {
    openCustomer()
    cy.get('tbody tr').should('have.length.gte', 3)

    cy.contains('button', 'Neues Abonnement').click()
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.wait('@createAbonement')

    cy.get('tbody tr').first().find('button').first().click()
    cy.get('.aug-modal:visible select').last().select('cancelled')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.wait('@updateAbonement')

    cy.get('tbody tr').first().find('button').last().click()
    cy.get('.aug-modal:visible').contains('button', 'Abbrechen').click()
    cy.get('tbody tr').first().find('button').last().click()
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
    cy.wait('@deleteAbonement')
  })

  it('deletes the customer', () => {
    openCustomer()
    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible').contains('button', 'Abbrechen').click()
    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
    cy.wait('@deleteCustomer')
    cy.url().should('match', /\/backoffice\/customers\/?$/)
  })

  it('shows an error when the abonement product is missing', () => {
    stubBackend()
    cy.intercept('GET', '**/api/items/backoffice*', { statusCode: 200, body: [] })
    cy.loginBackoffice('/backoffice/customers/501')
    cy.get('#firstname').should('have.value', 'Stub')
    cy.contains('button', 'Neues Abonnement').click()
    cy.get('.toast').should('be.visible')
  })

  it('shows errors when saving and deleting fail', () => {
    stubBackend()

    cy.intercept('PUT', '**/api/customers/501/', {
      statusCode: 400,
      body: { error: { message: 'E-Mail vergeben' } }
    })

    cy.intercept('DELETE', '**/api/customers/501/', { statusCode: 500, body: {} })
    cy.loginBackoffice('/backoffice/customers/501')
    cy.get('#firstname').should('have.value', 'Stub')
    cy.contains('button', 'Speichern').click()
    cy.get('.toast').should('contain', 'E-Mail vergeben')
    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
    cy.get('.toast').should('be.visible')
  })
})
