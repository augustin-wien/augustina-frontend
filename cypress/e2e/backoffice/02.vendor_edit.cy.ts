const tempLicenceID = 'fl-245'
const basicLicenceId = 'fl-123'

function openVendor(licenseId: string) {
  cy.get('#searchInput').clear().type(licenseId)
  cy.get('tbody tr').should('have.length', 1)
  cy.get('tbody tr a[href^="/backoffice/userprofile/"]').first().click()
  cy.contains('button', 'Bearbeiten').click()
}

describe('Edit a vendor', () => {
  it('changes the license id and changes it back', () => {
    cy.loginBackoffice('/backoffice/vendorsummary')
    cy.get('th').contains('Ausweisnummer')

    openVendor(basicLicenceId)
    cy.get('#licenseID').clear().type(tempLicenceID)
    cy.get('#language').clear().type('de')
    cy.get('button').contains('Bestätigen').click()

    cy.visit('/backoffice/vendorsummary')
    openVendor(tempLicenceID)
    cy.get('#licenseID').clear().type(basicLicenceId)
    cy.get('button').contains('Bestätigen').click()
  })
})
