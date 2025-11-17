import QrCodeSettings from '@/components/QrCodeSettings.vue'

// Simple smoke test: mount inline variant and check that controls render
describe('QrCodeSettings component', () => {
  it('renders inline QR code settings and preview wrapper', () => {
    // set minimal settings in the store before mount
    const wrapper = document.createElement('div')
    wrapper.setAttribute('id', 'app')
    document.body.appendChild(wrapper)

    cy.mount(QrCodeSettings, { props: { inline: true } })

    cy.get('#qr-wrapper').should('exist')
    cy.get('select').first().should('exist')
  })
})
