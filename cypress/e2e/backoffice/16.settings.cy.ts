function stubSaves() {
  cy.intercept('PUT', '**/api/settings/', { statusCode: 200, body: {} }).as('saveSettings')
  cy.intercept('PUT', '**/api/settings/css/', { statusCode: 200, body: {} }).as('saveCss')
  cy.intercept('POST', '**/api/settings/nextcloud/test/', {
    statusCode: 200,
    body: { Success: true, Message: 'Verbindung steht' }
  }).as('testNextcloud')
  cy.intercept('POST', '**/api/settings/wordpress-invite/test/', {
    statusCode: 200,
    body: { Success: true, Message: 'Einladung erzeugt', Link: 'https://example.org/invite' }
  }).as('testWordPress')
  cy.intercept('POST', '**/api/mail-templates/', { statusCode: 200, body: {} }).as('saveTemplate')
  cy.intercept('POST', '**/api/mail-templates/*/send/', { statusCode: 200, body: {} }).as('sendTemplate')
}

function openSettings() {
  stubSaves()
  cy.loginBackoffice('/backoffice/settings/update')
  cy.get('.tab-nav').should('be.visible')
}

function save() {
  cy.get('.save-footer button').click()
}

describe('General settings', () => {
  it('changes the shop settings and saves them', () => {
    openSettings()
    cy.get('#newspapername').should('be.visible')

    cy.get('.toggle-grid input[type="checkbox"]').each(($toggle) => {
      cy.wrap($toggle).click({ force: true })
    })
    cy.get('.toggle-grid input[type="checkbox"]').each(($toggle) => {
      cy.wrap($toggle).click({ force: true })
    })

    cy.get('.section input[type="number"]').first().clear().type('25')
    cy.get('.section select').first().find('option').its('length').should('be.gte', 1)
    cy.get('.section select').first().select(0)

    save()
    cy.wait('@saveSettings')
    cy.get('.toast').should('be.visible')
  })

  it('shows the link buttons and the map center', () => {
    openSettings()
    cy.get('.section input[type="text"]').each(($input) => {
      if ($input.is(':visible') && !$input.is('[readonly]')) cy.wrap($input).type('x', { force: true })
    })
    cy.get('.section input[type="text"]').each(($input) => {
      if ($input.is(':visible') && !$input.is('[readonly]')) cy.wrap($input).type('{backspace}', { force: true })
    })
    cy.contains('button', 'Open').click({ force: true })
  })

  it('rejects an invalid vendor email postfix', () => {
    openSettings()
    cy.get('#newspapername').should('be.visible')
    cy.get('#vendorEmailPostfix').clear().type('keine domain @@ so')
    save()
    cy.get('.toast').should('be.visible')
    cy.get('@saveSettings.all').should('have.length', 0)
  })
})

describe('Module settings', () => {
  it('switches every module on and runs the connection tests', () => {
    openSettings()
    cy.contains('.tab-btn', 'Module').click()

    cy.get('.module-switch input').each(($switch) => {
      if (!$switch.prop('checked')) cy.wrap($switch).check({ force: true })
    })

    cy.get('.module-body').should('have.length.gte', 1)
    cy.get('.module-body input[type="text"], .module-body input[type="url"]').each(($input) => {
      if ($input.is(':visible')) cy.wrap($input).clear({ force: true }).type('https://example.org', { force: true })
    })
    cy.get('.module-body input[type="password"]').each(($input) => {
      cy.wrap($input).type('geheim', { force: true })
    })
    cy.get('#voucherEnabled').check({ force: true })

    cy.get('.connection-test button').click()
    cy.wait('@testNextcloud')
    cy.get('.connection-test-result').should('be.visible')

    cy.get('.wp-invite-test button').click()
    cy.wait('@testWordPress')
    cy.get('.wp-invite-test-result').should('be.visible')

    save()
    cy.wait('@saveSettings')
  })

  it('switches the modules off again', () => {
    openSettings()
    cy.contains('.tab-btn', 'Module').click()
    cy.get('.module-switch input').each(($switch) => {
      if ($switch.prop('checked')) cy.wrap($switch).uncheck({ force: true })
    })
    cy.get('.module-body').should('not.exist')
    save()
    cy.wait('@saveSettings')
  })
})

describe('Custom styles', () => {
  it('edits and saves the css', () => {
    openSettings()
    cy.contains('.tab-btn', 'Eigenes CSS').click()
    cy.get('#styles').type('{moveToEnd}\n/* e2e */')
    save()
    cy.wait('@saveCss')
  })
})

describe('Mail templates', () => {
  it('edits, previews and tests a mail template', () => {
    openSettings()
    cy.contains('.tab-btn', 'E-Mail Vorlagen').click()

    cy.get('.sender-row input').clear().type('Augustin Test{enter}')
    cy.get('.template-item').first().click()
    cy.get('.editor-col input').first().clear().type('Neuer Betreff')
    cy.get('.body-textarea').type(' Hallo')
    cy.get('.var-chip').first().click()
    cy.contains('.view-toggle-btn', 'Vorschau').click()
    cy.get('.body-preview').should('be.visible')
    cy.contains('.view-toggle-btn', 'Bearbeiten').click()

    cy.get('.editor-col input[placeholder="example@domain.tld"]').type('test@example.org')
    cy.contains('.editor-col button', /Test|senden/i).click()
    cy.wait('@sendTemplate')

    cy.contains('.editor-col button', 'Speichern').click()
    cy.wait('@saveTemplate')

    cy.get('.template-item').eq(1).click()
    cy.get('.template-item').first().click()
  })
})
