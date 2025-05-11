// https://on.cypress.io/api
// deactivate eslint for this file
/* eslint-disable */
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
    const licenseId = RandomInput.getRandomId()
    // create a vendor
    cy.get("button").contains("Neu").click()
    cy.get("#firstName").type(RandomInput.getRandomFirstName());
    cy.get("#lastName").type(RandomInput.getRandomLastName());
    cy.get("#email").clear()
    cy.get("#email").type(RandomInput.getRandomEmail());
    cy.get('#licenseID').type(licenseId)
    cy.get("button").contains("Anlegen").click()
    
    // Delete it again
    cy.get('#searchInput').type(licenseId)
    cy.get('.text-sm > :nth-child(1) > .flex > :nth-child(1)').click()
    cy.get("button").contains("Bearbeiten").click()
    cy.get("#delete-vendor").click()
    cy.get("#delete-vendor-confirm").click()

    // Create vendor again
    cy.get("button").contains("Neu").click()
    cy.get("#firstName").type(RandomInput.getRandomFirstName());
    cy.get("#lastName").type(RandomInput.getRandomLastName());
    cy.get("#email").clear()
    cy.get("#email").type(RandomInput.getRandomEmail());
    cy.get('#licenseID').type(licenseId)
    cy.get("button").contains("Anlegen").click()
    


  })
})
