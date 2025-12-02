describe('Backoffice product update - licenseitem constraint', () => {
  it('shows backend constraint error when updating item with already used LicenseItem', () => {
    // stub items and backoffice items GET so the page can populate the form
    cy.intercept('GET', '**/api/items/backoffice*', {
      statusCode: 200,
      body: [
        {
          ID: 5,
          Name: 'Digitale Zeitung',
          Description: 'Digitale Zeitungsausgabe',
          Image: 'img/Digital_0_2.jpg',
          IsLicenseItem: false,
          IsPDFItem: false,
          ItemOrder: 0,
          LicenseGroup: 'testedition',
          LicenseItem: 4,
          Price: 300,
          Disabled: true,
          Archived: false
        }
      ]
    }).as('getItemsBackoffice')

    // also stub generic items GET to avoid accidental network calls
    cy.intercept('GET', '**/api/items*', {
      statusCode: 200,
      body: []
    }).as('getItems')

    // stub the PUT request to simulate the backend constraint failure (HAR)
    cy.intercept('PUT', '**/api/items/5/**', {
      statusCode: 400,
      body: {
        error: {
          message:
            'ent: constraint failed: one of [4] is already connected to a different licenseitem'
        }
      }
    }).as('updateItem')

    // visit the update page
    cy.visit('/backoffice/productsettings/update/5')

    // wait until the backoffice items request resolves and the form is populated
    cy.wait('@getItemsBackoffice')

    // ensure the Name input contains the expected value
    cy.get('#Name').should('have.value', 'Digitale Zeitung')

    // click the confirmation button (German "Bestätigen" or english "Confirmation")
    cy.contains('button', /Bestätigen|Confirmation|confirmation/).click()

    // wait for the PUT call
    cy.wait('@updateItem')

    // toast element should show the backend error message
    cy.get('.toast').should('contain', 'constraint failed')
    cy.get('.toast').should('contain', 'licenseitem')
  })
})
