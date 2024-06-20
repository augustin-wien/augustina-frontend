// https://on.cypress.io/api
// deactivate eslint for this file
/* eslint-disable */

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
    cy.get('#searchInput').type("fl-123")
    cy.get('[href="/backoffice/userprofile/1"] > .p-2').click()


    cy.wait(2500)
    cy.get('button').contains("Ändern").click()
    cy.get('#licenseID').clear().type("fl-234")
    cy.get('#adress').clear().type("Teststraße 123")
    cy.get('#language').clear().type("de")
    cy.get("button").contains("Speichern").click()
    cy.get('#searchInput').type("fl-234")
    cy.get('[href="/backoffice/userprofile/1"] > .p-2').click()


    cy.wait(2500)
    cy.get('button').contains("Ändern").click()
    cy.get('#licenseID').clear().type("fl-123")
    cy.get("button").contains("Speichern").click()
  })
})
