// https://on.cypress.io/api
// deactivate eslint for this file
/* eslint-disable */

const tempLicenceID = "fl-245"
const basicLicenceId = "fl-123"

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
    cy.get('#searchInput').type(basicLicenceId)
    cy.get('[href="/backoffice/userprofile/1"] > .p-2').click()


    cy.wait(2500)
    cy.get('button').contains("ändern").click()
    cy.get('#licenseID').clear().type(tempLicenceID)
    cy.get('#adress').clear().type("Teststraße 123")
    cy.get('#language').clear().type("de")
    cy.get("button").contains("Speichern").click()
    cy.wait(1000)
    cy.get("button").contains("X").click()

    cy.get('#searchInput').type(tempLicenceID)
    cy.get('[href="/backoffice/userprofile/1"] > .p-2').click()


    cy.wait(2500)
    cy.get('button').contains("ändern").click()
    cy.get('#licenseID').clear().type(basicLicenceId)
    cy.get("button").contains("Speichern").click()
  })
})
