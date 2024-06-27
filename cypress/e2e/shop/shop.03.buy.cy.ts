// https://on.cypress.io/api
const licenseId = "fl-123"

describe('Reach the shop page', () => {
  it('visits the app root url', () => {
    cy.visit('/v/' + licenseId)
    cy.contains('div', 'Zeitung kaufen bei')
    cy.get('button').contains('Weiter').click()
    cy.get('button').contains('Heute nicht').click()
    cy.get('#checkbox').click()
    cy.get('button').contains('Weiter').click()

    cy.origin('https://demo.vivapayments.com', { args: {} }, () => {
      cy.contains('span', 'Zeitung, fl-123')
      cy.get('#formatted-amount').contains('3,00')
      cy.get('#card-holder').type('John Doe')
      cy.get('#card-number').type('4147 4630 1111 0133')
      cy.get('#card-expiration').type('12/30')
      cy.get('#cvv').type('123')
      console.log(123)
      cy.get('#pay-btn > .v-btn__content').click()
    })

    console.log(456)

    cy.origin('https://shop.o.augustin.convive.io', { args: {} }, () => {
      cy.contains('h1', 'Transaktion fehlgeschlagen')
      console.log(window.location.href)

      cy.url().then((url) => {
        cy.log('Current URL is: ' + url)
      })
    })

    
  })
})
