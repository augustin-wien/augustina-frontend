import { RandomInput } from '../../../src/utils/utils'

function createVendor(licenseId: string) {
  cy.get('button').contains('Neu').click()
  cy.get('#firstName').type(RandomInput.getRandomFirstName())
  cy.get('#lastName').type(RandomInput.getRandomLastName())
  cy.get('#licenseID').type(licenseId)
  cy.get('button').contains('Anlegen').click()
  cy.url().should('include', '/backoffice/vendorsummary')
}

describe('Create, delete and recreate a vendor', () => {
  it('can reuse the license id after deleting the vendor', () => {
    cy.loginBackoffice()
    const licenseId = RandomInput.getRandomId()

    createVendor(licenseId)

    cy.get('#searchInput').type(licenseId)
    cy.get('tbody tr').should('have.length', 1)
    cy.get('tbody tr a[href^="/backoffice/userprofile/"]').first().click()
    cy.get('button').contains('Bearbeiten').click()
    cy.get('#delete-vendor').click()
    cy.get('#delete-vendor-confirm').click()

    createVendor(licenseId)
  })
})
