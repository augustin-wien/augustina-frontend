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

    //change logo
    cy.get('[href="/backoffice/settings"]').click()
    cy.get('#editSettings').click()
    const fileName = 'logo.png';
    cy.get('input[type="file"]').selectFile(`cypress/e2e/backoffice/${fileName}`);
    cy.get('#saveSettings').click()

    // test changing newspaper name
    cy.get('[href="/backoffice/settings"]').click()
    cy.get('#editSettings').click()
    cy.get('#newspapername').clear().type("Zeitung2")
    cy.get('#saveSettings').click()
    cy.get('#newspapername_value').contains("Zeitung2")
    cy.get('[href="/backoffice/settings"]').click()
    cy.get('#editSettings').click()
    cy.get('#newspapername').clear().type("Zeitung")
    cy.get('#saveSettings').click()
    cy.get('#newspapername_value').contains("Zeitung")

    // check if logo still exists
    const fileUrl = 'http://localhost:3000/img/logo.png';
    // Download the file from the URL
    cy.request(fileUrl).then((response) => {
      // Read the local file
      cy.readFile(`cypress/e2e/backoffice/${fileName}`).then((localFile) => {
        // Compare the downloaded file content with the local file content
        expect(response.body).to.eq(localFile);
      });
    });

  })
})
