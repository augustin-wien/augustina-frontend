function saveSettings() {
  cy.get('.save-footer button').click()
}

function showQrCodeTab() {
  cy.contains('.tab-btn', 'QR-Code Einstellungen').click()
  cy.get('#qr-wrapper canvas').should('exist')
}

function openQrCodeTab() {
  cy.loginBackoffice('/backoffice/settings/update')
  showQrCodeTab()
}

function reopenQrCodeTab() {
  cy.visit('/backoffice/settings/update')
  showQrCodeTab()
}

describe('QR code settings', () => {
  it('changes the style of the test QR code', () => {
    openQrCodeTab()

    cy.get('.qr-options select').eq(0).select('L')
    cy.get('.qr-options select').eq(0).select('H')

    cy.get('.qr-options select').eq(1).select('rounded')
    cy.get('.qr-options select').eq(1).select('square')
    cy.get('.qr-options select').eq(2).select('square')
    cy.get('.qr-options select').eq(3).select('square')
    cy.get('.qr-options select').eq(1).select('dots')
    cy.get('.qr-options select').eq(2).select('dot')
    cy.get('.qr-options select').eq(3).select('dot')

    cy.get('.qr-options input[type="color"]').first().then(($color) => {
      cy.wrap($color).invoke('val', '#aa0000').trigger('input')
    })
    cy.get('.qr-options input[type="color"]').last().invoke('val', '#eeeeee').trigger('input')
    cy.get('.qr-options input[type="color"]').first().invoke('val', '#000000').trigger('input')
    cy.get('.qr-options input[type="color"]').last().invoke('val', '#ffffff').trigger('input')

    cy.get('#qr-wrapper canvas').should('be.visible')
  })

  it('sets the logo in the QR code', () => {
    openQrCodeTab()

    cy.get('.toggle-inline input[type="checkbox"]').then(($toggle) => {
      const wasEnabled = $toggle.prop('checked')

      if (!wasEnabled) cy.wrap($toggle).check({ force: true })

      cy.get('input[type="file"]').last().selectFile('cypress/e2e/backoffice/logo.png')
      cy.get('img[alt="QR code logo preview"]').should('be.visible')

      cy.get('.qr-options .aug-toggle input').check({ force: true })
      cy.get('.qr-options input[type="number"]').first().clear().type('0.4')
      cy.get('.qr-options input[type="number"]').last().clear().type('5')
      cy.get('.qr-options .aug-toggle input').uncheck({ force: true })

      saveSettings()
      cy.contains('.toast', /gespeichert|erfolgreich/i).should('be.visible')

      reopenQrCodeTab()
      cy.get('.toggle-inline input[type="checkbox"]').should('be.checked')

      if (!wasEnabled) {
        cy.get('.toggle-inline input[type="checkbox"]').uncheck({ force: true })
        saveSettings()
      }
    })
  })

  it('changes the QR code url and downloads the test QR code', () => {
    openQrCodeTab()

    cy.get('.field-grid input[type="text"]').first().invoke('val').then((url) => {
      cy.get('.field-grid input[type="text"]').first().clear().type('https://example.org')
      cy.contains('button', 'Test QR-Code herunterladen').click()
      cy.contains('button', 'QR-Code Einstellungen speichern').click()
      reopenQrCodeTab()
      cy.get('.field-grid input[type="text"]').first().clear().type(String(url))
      saveSettings()
    })
  })

  it('downloads the QR codes of all vendors', () => {
    openQrCodeTab()
    cy.contains('button', 'für alle Verkäufer:innen herunterladen').click()
  })
})
