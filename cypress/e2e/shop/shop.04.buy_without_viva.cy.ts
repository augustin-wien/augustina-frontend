const licenseId = 'fl-123'

describe('Reach the shop page', () => {
  it('walks through the shop up to the payment', () => {
    cy.visit('/v/' + licenseId)
    cy.contains('div', 'Zeitung kaufen bei')
    cy.contains('button', 'Nein, danke').click()
    cy.get('button').contains('Weiter').click()
    cy.get('button').contains('Heute nicht').click()
    cy.get('#checkbox').click()
    cy.get('button').contains('Weiter').click()
  })
})
