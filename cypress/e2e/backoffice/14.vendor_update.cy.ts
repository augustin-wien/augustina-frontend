import { RandomInput } from '../../../src/utils/utils'

const licenseId = RandomInput.getRandomId()

function openVendorUpdate() {
  cy.loginBackoffice('/backoffice/vendorsummary')
  cy.get('#searchInput').type(licenseId)
  cy.get('tbody tr').should('have.length', 1)
  cy.get('tbody tr a[href^="/backoffice/userprofile/"]').first().click()
  cy.contains('button', 'Bearbeiten').click()
  cy.get('#licenseID').should('have.value', licenseId)
}

describe('Vendor with all fields', () => {
  it('creates a vendor with every field filled', () => {
    cy.loginBackoffice('/backoffice/newvendor')
    cy.get('#firstName').type('Erika')
    cy.get('#lastName').type('Musterfrau')
    cy.get('#useOwnEmail').check({ force: true })
    cy.get('#email').type(RandomInput.getRandomEmail())
    cy.get('#licenseID').type(licenseId)
    cy.get('#language').type('de')
    cy.get('#telephone').type('+43 660 1234567')
    cy.get('#registrationDate').type('2024-01-15')
    cy.get('#vendorSince').type('2024-02-01')
    cy.get('#verification').type('https://example.org/proof')
    cy.get('#debt').type('10')
    cy.get('#hasBankAccount').check({ force: true })
    cy.get('#hasSmartphone').check({ force: true })
    cy.contains('button', 'Anlegen').click()
    cy.url().should('include', '/backoffice/vendorsummary')
  })

  it('rejects a second vendor with the same license id', () => {
    cy.loginBackoffice('/backoffice/newvendor')
    cy.get('#firstName').type('Doppelt')
    cy.get('#lastName').type('Vergeben')
    cy.get('#licenseID').type(licenseId)
    cy.contains('button', 'Anlegen').click()
    cy.get('.toast').should('be.visible')
  })
})

describe('Vendor locations', () => {
  it('adds and edits locations with every working time mode', () => {
    openVendorUpdate()

    cy.contains('button', 'Neuer Standort').click()
    cy.get('#name').type('E2E Standort')
    cy.get('#adress').type('Teststraße 1')
    cy.get('#plz').type('1010')
    cy.get('#location-market-number').type('42')
    cy.get('#location-telephone').type('0660 111')
    cy.get('#location-long').clear().type('16.37')
    cy.get('#location-lat').clear().type('48.2')

    cy.get('#workingTime').select('everyday')
    cy.get('.aug-modal:visible .working-time-panel input[type="checkbox"]').first().check({ force: true })
    cy.get('.aug-modal:visible .working-time-panel input[type="checkbox"]').first().uncheck({ force: true })
    cy.get('.aug-modal:visible .working-time-panel input[type="time"]').first().type('08:00')
    cy.get('.aug-modal:visible .working-time-panel input[type="time"]').last().type('16:00')

    cy.get('#workingTime').select('by_day')
    cy.get('.aug-modal:visible .working-time-day').first().find('input[type="checkbox"]').first().check({ force: true })
    cy.get('.aug-modal:visible .working-time-day').eq(1).find('input[type="time"]').first().type('09:00')

    cy.get('#workingTime').select('whole_week')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-title', 'E2E Standort').should('be.visible')

    cy.contains('.entry-row', 'E2E Standort').find('button[title="Bearbeiten"]').click()
    cy.get('#name').clear().type('E2E Standort 2')
    cy.get('#workingTime').select('everyday')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-title', 'E2E Standort 2').should('be.visible')
  })

  it('removes a location', () => {
    openVendorUpdate()
    cy.contains('.entry-row', 'E2E Standort 2').find('button[title="Löschen"]').click()
    cy.contains('.entry-title', 'E2E Standort 2').should('not.exist')
  })
})

describe('Vendor comments on the update page', () => {
  it('adds, edits and deletes a comment', () => {
    openVendorUpdate()
    cy.contains('button', 'Kommentar hinzufügen').click()
    cy.get('#comment-text').type('Warnung vom E2E')
    cy.get('.aug-modal:visible input[type="checkbox"]').check({ force: true })
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-comment-text', 'Warnung vom E2E').should('be.visible')

    cy.contains('.entry-row', 'Warnung vom E2E').find('button[title="Bearbeiten"]').click()
    cy.get('#comment-text').type(' erledigt')
    cy.get('#comment-resolved').type('2026-01-01')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-comment-text', 'erledigt').should('be.visible')

    cy.contains('.entry-row', 'erledigt').find('button#delete-vendor-comment').click()
    cy.contains('.entry-comment-text', 'erledigt').should('not.exist')
  })
})

describe('Vendor status', () => {
  it('blocks and unblocks a vendor with a note', () => {
    openVendorUpdate()
    cy.get('#isBlocked').select('Ja')
    cy.get('#blockedNote:invalid').should('exist')
    cy.get('#blockedNote').type('Grund für die Sperre')
    cy.contains('button', 'Bestätigen').click()
    cy.get('.toast').should('be.visible')

    cy.get('#isBlocked').select('Nein')
    cy.contains('button', 'Bestätigen').click()
    cy.get('.toast').should('be.visible')
  })

  it('needs an email when the own email is switched on', () => {
    openVendorUpdate()
    cy.get('#useOwnEmail').check({ force: true })
    cy.get('#email').clear()
    cy.get('#email:invalid').should('exist')
    cy.get('#email').type(RandomInput.getRandomEmail())
    cy.contains('button', 'Bestätigen').click()
    cy.get('.toast').should('be.visible')
  })

  it('asks what happens to the locations when a vendor is deactivated', () => {
    openVendorUpdate()
    cy.contains('button', 'Neuer Standort').click()
    cy.get('#name').type('Standort zum Deaktivieren')
    cy.get('#location-long').clear().type('16.37')
    cy.get('#location-lat').clear().type('48.2')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-title', 'Standort zum Deaktivieren').should('be.visible')

    cy.get('#isDisabled').select('Ja')
    cy.contains('button', 'Bestätigen').click()
    cy.get('.aug-modal:visible').find('input[type="radio"]').eq(1).check({ force: true })
    cy.get('#disable-vendor-confirm').click()
    cy.get('.toast').should('be.visible')
  })

  it('deletes the vendor and its locations', () => {
    openVendorUpdate()
    cy.get('#isDisabled').select('Nein')
    cy.contains('button', 'Bestätigen').click()
    cy.get('.toast').should('be.visible')

    cy.contains('button', 'Neuer Standort').click()
    cy.get('#name').type('Standort zum Löschen')
    cy.get('#location-long').clear().type('16.37')
    cy.get('#location-lat').clear().type('48.2')
    cy.get('.aug-modal:visible').contains('button', 'Speichern').click()
    cy.contains('.entry-title', 'Standort zum Löschen').should('be.visible')

    cy.get('#delete-vendor').click()
    cy.get('.aug-modal:visible input[type="radio"][value="delete"]').check({ force: true })
    cy.get('#delete-vendor-confirm').click()
    cy.url().should('include', '/backoffice/vendorsummary')
  })
})
