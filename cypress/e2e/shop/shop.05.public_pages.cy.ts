const verification = {
  FirstName: 'Test',
  TimeStamp: '2026-01-01T10:00:00Z',
  TotalSum: 600,
  PurchasedItems: [
    { ID: 1, IsSale: true, Item: 1, Price: 300, Quantity: 2 },
    { ID: 2, IsSale: true, Item: 2, Price: 0, Quantity: 1 }
  ],
  PDFDownloadLinks: [{ ItemID: 1, Link: 'abc' }],
  InviteURL: ''
}

describe('Payment result pages', () => {
  it('confirms a verified payment', () => {
    cy.intercept('GET', '**/api/orders/verify/**', { statusCode: 200, body: verification }).as(
      'verify'
    )
    cy.visit('/success?s=123&t=456')
    cy.wait('@verify')
    cy.url().should('include', '/paymentconfirmation')
    cy.get('#payment-confirmation-page').should('be.visible')
  })

  it('sends a missing query to the failure page', () => {
    cy.visit('/success')
    cy.url().should('include', '/failure')
    cy.get('#retry-button').should('be.visible')
  })

  it('shows why Viva declined the payment', () => {
    cy.intercept('POST', '**/api/**', { statusCode: 200, body: {} })
    cy.visit('/failure?s=1234567890&eventId=10006&eci=1')
    cy.get('#failure-reason').should('be.visible')
  })

  it('retries a failed verification', () => {
    cy.intercept('GET', '**/api/orders/verify/**', { statusCode: 404, body: {} })
    cy.visit('/failure?orderCode=abc')
    cy.get('#retry-button').click()
  })

  it('shows the error pages', () => {
    ;['/404', '/error', '/error-invalid-link', '/maintenance', '/does/not/exist'].forEach((path) => {
      cy.visit(path)
      cy.get('body').should('be.visible')
    })
  })
})

describe('Redeem a voucher', () => {
  it('rejects an already redeemed voucher', () => {
    cy.intercept('POST', '**/api/vouchers/check/', {
      statusCode: 200,
      body: { Code: 'AAAA', Status: 'redeemed' }
    })
    cy.visit('/einloesen?code=AAAA')
    cy.get('#redeem-voucher-page').should('be.visible')
  })

  it('rejects a disabled voucher', () => {
    cy.intercept('POST', '**/api/vouchers/check/', {
      statusCode: 200,
      body: { Code: 'BBBB', Status: 'disabled' }
    })
    cy.visit('/einloesen?code=BBBB')
    cy.get('#redeem-voucher-page').should('be.visible')
  })

  it('shows an error for an unknown code', () => {
    cy.intercept('POST', '**/api/vouchers/check/', {
      statusCode: 404,
      body: { error: { message: 'not found' } }
    })
    cy.visit('/einloesen')
    cy.get('#voucher-code').type('ZZZZ{enter}')
  })

  it('redeems a valid voucher', () => {
    cy.intercept('POST', '**/api/vouchers/check/', {
      statusCode: 200,
      body: { Code: 'CCCC', Status: 'active', Name: 'Abo', DurationMonths: 3 }
    })
    cy.intercept('POST', '**/api/vouchers/redeem/', {
      statusCode: 200,
      body: { Code: 'CCCC', ValidUntil: '2027-01-01T00:00:00Z' }
    }).as('redeem')
    cy.visit('/einloesen')
    cy.get('#voucher-code').type('CCCC{enter}')
    cy.get('#voucher-details').should('be.visible')
    cy.get('#redeem-email').type('test@gmial.com').blur()
    cy.contains('button', 'gmail.com').click({ force: true })
    cy.get('#redeem-firstname').type('Max')
    cy.get('#redeem-lastname').type('Muster')
    cy.get('button[type="submit"]').click({ force: true })
    cy.wait('@redeem')
    cy.get('#redeem-success').should('be.visible')
  })
})
