// https://on.cypress.io/api
const licenseId = "fl-123"

describe('Reach the shop page', () => {
  it('visits the app root url', () => {
    cy.visit('/v/' + licenseId)
    cy.contains('div', 'Zeitung kaufen bei')
    cy.get('button').contains('Weiter').click()
    cy.get('button').contains('Heute nicht').click()
    cy.get('#checkbox').click()
    cy.get('button').contains('Weiter').click()
    
  })
})
