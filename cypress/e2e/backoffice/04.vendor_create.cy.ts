// https://on.cypress.io/api
// deactivate eslint for this file
 
import { RandomInput } from "../../../src/utils/utils";

describe('Go to backoffice', () => {
  it('visits the app root url', () => {
    cy.visit('/backoffice')

    cy.origin('http://keycloak:8080', { args: {} }, () => {
      cy.contains('h1', 'Sign in to your account')
      cy.get('#username').type("test_superuser@example.com")
      cy.get('#password').type("Test123!")
      cy.get('#kc-login').click()
    })

    cy.get("button").contains("Neu").click()
    cy.get("#firstName").type(RandomInput.getRandomFirstName());
    cy.get("#lastName").type(RandomInput.getRandomLastName());
    cy.get("#email").clear()
    cy.get("#email").type(RandomInput.getRandomEmail());
    cy.get('#licenseID').type(RandomInput.getRandomId())
    cy.get("button").contains("Anlegen").click()
  })
})
