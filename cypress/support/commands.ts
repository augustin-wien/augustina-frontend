/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginBackoffice(path?: string): Chainable<void>
      loginVendor(path?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginBackoffice', (path = '/backoffice') => {
  cy.visit(path)

  cy.origin('http://keycloak:8080', () => {
    cy.get('#kc-form-login').should('be.visible')
    cy.get('#username').type('test_superuser@example.com')
    cy.get('#password').type('Test123!')
    cy.get('#kc-login').click()
  })

  cy.get('h1.page-header-title').should('be.visible')
})

Cypress.Commands.add('loginVendor', (path = '/me') => {
  cy.visit(path)

  cy.origin('http://keycloak:8080', () => {
    cy.get('#kc-form-login').should('be.visible')
    cy.get('#username').type('test_vendor@example.com')
    cy.get('#password').type('Test123!')
    cy.get('#kc-login').click()
  })
})

export {}
