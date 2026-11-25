import { RandomInput } from '../../../src/utils/utils'

describe('Create a vendor', () => {
  it('creates a vendor and returns to the overview', () => {
    cy.loginBackoffice()

    cy.get('button').contains('Neu').click()
    cy.get('#firstName').type(RandomInput.getRandomFirstName())
    cy.get('#lastName').type(RandomInput.getRandomLastName())
    cy.get('#licenseID').type(RandomInput.getRandomId())
    cy.get('button').contains('Anlegen').click()

    cy.url().should('include', '/backoffice/vendorsummary')
  })
})
