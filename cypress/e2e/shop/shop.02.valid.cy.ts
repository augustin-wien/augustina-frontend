// https://on.cypress.io/api

describe('Reach the shop page', () => {
  it('visits the app root url', () => {
    cy.visit('/v/fl-123')
    cy.contains('div', 'Zeitung kaufen bei')
  })
})
