// https://on.cypress.io/api

describe('Reach the shop page', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('div', 'Die gescannte ID ist nicht gültig')
  })
})
