import StylesSettings from '@/components/settings/StylesSettings.vue'

describe('StylesSettings component', () => {
  it('renders textarea and allows editing', () => {
    cy.mount(StylesSettings)

    cy.get('#styles').should('exist')
    cy.get('#styles').clear().type('body { background: red }').should('have.value', 'body { background: red }')
  })
})
