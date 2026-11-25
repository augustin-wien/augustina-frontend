type StubItem = Record<string, unknown>

const baseItem = {
  Description: 'Beschreibung',
  Image: '',
  IsLicenseItem: false,
  IsPDFItem: false,
  ItemOrder: 0,
  ItemColor: null,
  ItemTextColor: null,
  LicenseGroup: '',
  LicenseItem: null,
  LicenseCost: 0,
  Price: 300,
  Disabled: false,
  Archived: false
}

const items: StubItem[] = [
  { ...baseItem, ID: 101, Name: 'Stub Normal', Type: 'normal_item' },
  {
    ...baseItem,
    ID: 102,
    Name: 'Stub Online',
    Type: 'online_issue',
    LicenseGroup: 'stub_group',
    LicenseItem: 105
  },
  { ...baseItem, ID: 103, Name: 'Stub Abo', Type: 'abonement', LicenseGroup: 'stub_group' },
  {
    ...baseItem,
    ID: 104,
    Name: 'Stub Gutschein',
    Type: 'abonement_voucher',
    LicenseGroup: 'stub_group',
    AboDurationMonths: 6
  },
  {
    ...baseItem,
    ID: 105,
    Name: 'Stub Lizenz',
    Type: 'license_item',
    IsLicenseItem: true,
    LicenseGroup: 'stub_group'
  },
  { ...baseItem, ID: 106, Name: 'Stub PDF', Type: 'issue', IsPDFItem: true, LicenseItem: 105, PDF: 'pdf/x.pdf' }
]

function stubBackend(mailStatus: unknown = { Counts: {}, Total: 0, FirstQueuedAt: null, LastSentAt: null }) {
  cy.intercept('GET', '**/api/items/backoffice*', { statusCode: 200, body: items })
  cy.intercept('GET', '**/api/items/', { statusCode: 200, body: items })
  cy.intercept('GET', '**/api/items/?*', { statusCode: 200, body: items })
  cy.intercept('GET', '**/api/items/wordpress-issue/*', (req) => {
    const group = String(req.query.licenseGroup ?? '')

    req.reply({
      statusCode: 200,
      body: {
        configured: true,
        ok: group === 'stub_group',
        message: group === 'stub_group' ? 'Ausgabe 12 ist veröffentlicht' : 'Ausgabe nicht gefunden',
        issue: { exists: group === 'stub_group', issue_number: '12', published: true, is_demo: false }
      }
    })
  })
  cy.intercept('GET', '**/api/items/102/notify-abonements/', { statusCode: 200, body: mailStatus })
  cy.intercept('POST', '**/api/items/102/notify-abonements/', {
    statusCode: 200,
    body: { recipients: 3, alreadyMailed: 0 }
  }).as('notify')
  cy.intercept('PUT', '**/api/items/*/', { statusCode: 200, body: {} }).as('updateItem')
  cy.intercept('DELETE', '**/api/items/*/*', { statusCode: 204, body: '' }).as('deleteItem')
}

function openItem(id: number) {
  cy.loginBackoffice(`/backoffice/productsettings/update/${id}`)
  cy.get('#itemName').should('be.visible')
}

function reopenItem(id: number) {
  cy.visit(`/backoffice/productsettings/update/${id}`)
  cy.get('#itemName').should('be.visible')
}

describe('Product update by item type', () => {
  it('edits a normal item and its colors', () => {
    stubBackend()
    openItem(101)
    cy.get('#itemName').clear().type('Stub Normal 2')
    cy.get('#description').clear().type('Neu')
    cy.get('#price').clear().type('450')
    cy.get('#itemOrder').clear().type('3')
    cy.get('#itemColor').invoke('val', '#112233').trigger('input')
    cy.get('#itemTextColor').invoke('val', '#ffffff').trigger('input')
    cy.get('#isDisabled').check({ force: true })
    cy.contains('button', 'Speichern').click()
    cy.wait('@updateItem')
  })

  it('changes the item type', () => {
    stubBackend()
    openItem(101)
    cy.get('#itemType option').then(($options) => {
      const types = Array.from($options).map((option) => (option as HTMLOptionElement).value)

      types.forEach((type) => {
        cy.get('#itemType').select(type)
      })
    })
  })

  it('checks the license group of an online issue against WordPress', () => {
    stubBackend()
    openItem(102)
    cy.get('#licenseGroup').should('have.value', 'stub_group')
    cy.contains('button', 'In WordPress prüfen').click()
    cy.get('.wp-issue-check-result').should('have.class', 'is-success')
    cy.get('#licenseGroup').clear().type('unknown_group')
    cy.contains('button', 'In WordPress prüfen').click()
    cy.get('.wp-issue-check-result').should('have.class', 'is-error')
  })

  it('sends an online issue to the abonnents', () => {
    stubBackend()
    openItem(102)
    cy.contains('button', 'Abonnent').click()
    cy.get('.aug-modal:visible').contains('button', 'Abbrechen').click()
    cy.contains('button', 'Abonnent').click()
    cy.get('.aug-modal:visible').contains('button', 'Jetzt senden').click()
    cy.wait('@notify')
    cy.get('.toast').should('be.visible')
  })

  it('shows the delivery status of an online issue that was already sent', () => {
    stubBackend({
      Counts: { sent: 2, failed: 1, pending: 1 },
      Total: 4,
      FirstQueuedAt: '2026-01-01T10:00:00Z',
      LastSentAt: '2026-01-01T11:00:00Z'
    })
    openItem(102)
    cy.get('[data-test="mail-status"]').should('be.visible')
    cy.get('.mail-status-failed').should('be.visible')
  })

  it('edits an abonement and a voucher', () => {
    stubBackend()
    openItem(103)
    cy.get('#licenseGroup').clear().type('another_group')
    cy.contains('button', 'Speichern').click()
    cy.wait('@updateItem')

    reopenItem(104)
    cy.get('#aboDurationMonths').clear().type('12')
    cy.contains('button', 'Speichern').click()
    cy.wait('@updateItem')

    reopenItem(104)
    cy.get('#aboDurationMonths').clear().type('0')
    cy.contains('button', 'Speichern').click()
    cy.get('.toast').should('be.visible')
  })

  it('needs a license group for an abonement', () => {
    stubBackend()
    openItem(103)
    cy.get('#licenseGroup').clear()
    cy.get('#licenseGroup:invalid').should('exist')
  })

  it('edits a license item and a PDF item', () => {
    stubBackend()
    openItem(105)
    cy.get('#isLicenseItem').should('be.checked')

    reopenItem(106)
    cy.get('#isPDFItem').should('be.checked')
    cy.get('#pdf').should('exist')
    cy.get('#isPDFItem').uncheck({ force: true })
    cy.get('#licenseGroup').should('be.visible')
    cy.get('#isPDFItem').check({ force: true })
  })

  it('shows the item that uses a license item', () => {
    stubBackend()
    openItem(105)
    cy.get('#delete-item, button').contains('Löschen').click()
    cy.get('.aug-modal:visible').should('contain', 'Stub Online')
    cy.get('.aug-modal:visible').contains('button', 'Abbrechen').click()
  })

  it('deletes an item together with its license item', () => {
    stubBackend()
    openItem(102)
    cy.contains('button', 'Löschen').click()
    cy.get('.aug-modal:visible input[type="checkbox"]').check({ force: true })
    cy.get('.aug-modal:visible').contains('button', 'Löschen').click()
    cy.wait('@deleteItem')
  })
})
