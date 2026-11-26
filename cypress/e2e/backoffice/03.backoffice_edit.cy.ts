function openSettings() {
  cy.visit('/backoffice/settings/update')
  cy.get('#newspapername').should('be.visible')
}

function saveSettings() {
  cy.get('.save-footer button').click()
}

describe('Edit the settings', () => {
  it('changes the newspaper name and the logo', () => {
    cy.loginBackoffice('/backoffice/settings/update')
    cy.get('#newspapername').should('be.visible')

    cy.get('input[type="file"]').first().selectFile('cypress/e2e/backoffice/logo.png')
    saveSettings()

    openSettings()
    cy.get('#newspapername').clear().type('Zeitung2')
    saveSettings()
    openSettings()
    cy.get('#newspapername').should('have.value', 'Zeitung2')

    cy.get('#newspapername').clear().type('Zeitung')
    saveSettings()
    openSettings()
    cy.get('#newspapername').should('have.value', 'Zeitung')
  })
})
