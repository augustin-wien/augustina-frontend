import { RandomInput } from '../../../src/utils/utils'

describe('Customers', () => {
  it('creates, edits and deletes a customer with an abonement', () => {
    const email = RandomInput.getRandomEmail()

    cy.loginBackoffice('/backoffice/customers')
    cy.get('input').first().type('nobody-matches-this')
    cy.get('input').first().clear()
    cy.visit('/backoffice/customers/new')
    cy.get('#firstname').type('E2E')
    cy.get('#lastname').type('Customer')
    cy.get('#email').type(email)
    cy.get('#newsletter').check({ force: true })
    cy.contains('button', 'Speichern').click()
    cy.url().should('match', /\/backoffice\/customers\/?$/)
    cy.get('input').first().type(email)
    cy.get('tbody tr').should('have.length', 1)
    cy.contains('tbody tr button', 'Bearbeiten').click()
    cy.url().should('match', /customers\/\d+/)

    cy.get('#lastname').clear().type('Customer2')
    cy.contains('button', 'Speichern').click()

    cy.contains('button', 'Abo').click()
    cy.contains('button', 'Abbrechen').click()

    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
  })
})

describe('Products', () => {
  const name = 'E2E ' + RandomInput.getRandomId()

  it('creates a product', () => {
    cy.loginBackoffice('/backoffice/newproduct')
    cy.get('#itemType').select(0)
    cy.get('#name').type(name)
    cy.get('#description').type('Beschreibung')
    cy.get('#price').type('250')
    cy.contains('button', 'Anlegen').click()
    cy.url().should('include', '/backoffice/productsettings')
    cy.contains(name).should('be.visible')
  })

  it('switches the tabs, edits and deletes the product', () => {
    cy.loginBackoffice('/backoffice/productsettings')
    cy.contains('button', 'Archiv').click()
    cy.contains('button', 'Aktiv').click()
    cy.contains(name).parents('tr').contains('button', 'Bearbeiten').click()
    cy.get('#itemName').should('have.value', name)
    cy.get('#description').clear().type('Neu')
    cy.contains('button', 'Speichern').click()
    cy.url().should('include', '/backoffice/productsettings')
    cy.contains(name).parents('tr').contains('button', 'Bearbeiten').click()
    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
    cy.url().should('include', '/backoffice/productsettings')
  })
})

describe('Campaigns', () => {
  it('creates and removes a campaign', () => {
    cy.loginBackoffice('/backoffice/campaigns')
    cy.contains('button', 'Neu').click()
    cy.get('#campaign-form input[type="text"]').first().type('E2E Kampagne')
    cy.get('#campaign-form select').select(1)
    cy.get('button[form="campaign-form"]').click()
    cy.contains('E2E Kampagne').should('be.visible')

    cy.contains('tr', 'E2E Kampagne').find('input[type="checkbox"]').uncheck({ force: true })
    cy.contains('tr', 'E2E Kampagne').find('button[title="Bearbeiten"]').click()
    cy.contains('button', 'Abbrechen').click()
    cy.contains('tr', 'E2E Kampagne').find('button[title="Löschen"]').click()
  })
})

describe('Locations', () => {
  it('searches and filters locations', () => {
    cy.loginBackoffice('/backoffice/locations')
    cy.get('#locationSearch').type('a')
    cy.get('#locationFilter').select(1)
    cy.get('#locationFilter').select(0)
    cy.get('#locationSearch').clear()
    cy.contains('button', 'Neu').click()
  })
})

describe('Vouchers', () => {
  it('opens the voucher list', () => {
    cy.loginBackoffice('/backoffice/vouchers')
    cy.get('input').first().type('x')
    cy.get('input').first().clear()
  })
})
