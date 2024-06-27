// https://on.cypress.io/api

describe('Go to backoffice', () => {
  it('visits the app root url', () => {
    cy.visit('/backoffice')

    cy.origin('http://keycloak:8080', { args: {} }, () => {
      cy.contains('h1', 'Sign in to your account')
      cy.get('#username').type("test_superuser@example.com")
      cy.get('#password').type("Test123!")
      cy.get('#kc-login').click()
    })

    cy.get("th").contains("Ausweisnummer")
  })
})
