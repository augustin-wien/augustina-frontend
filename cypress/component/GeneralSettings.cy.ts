import GeneralSettings from '@/components/settings/GeneralSettings.vue'

describe('GeneralSettings component', () => {
  it('renders and binds newspaper name input', () => {
    cy.mount(GeneralSettings, {
      props: {
        updatedSettings: {
          ID: 0,
          AGBUrl: '',
          Color: '#000',
          FontColor: '#000',
          Favicon: '',
          Logo: '',
          MainItem: 1,
          MainItemDescription: '',
          MainItemImage: '',
          MainItemName: '',
          MainItemPrice: 0,
          MaintainanceModeHelpUrl: '',
          MaxOrderAmount: 0,
          NewspaperName: 'Initial',
          OrgaCoversTransactionCosts: false,
          QRCodeLogoImgUrl: '',
          QRCodeUrl: '',
          QRCodeSettings: '',
          QRCodeEnableLogo: false,
          VendorNotFoundHelpUrl: '',
          VendorEmailPostfix: '',
          WebshopIsClosed: false,
          MapCenterLat: 0.1,
          MapCenterLong: 0.1,
          UseVendorLicenseIdInShop: false,
          UseTipInsteadOfDonation: false,
          ShopLanding: false,
          DigitalItemsUrl: '',
          Keycloak: null
        },
        items: [],
        url: 'http://localhost/'
      }
    })

    cy.get('#newspapername').should('have.value', 'Initial')
    cy.get('#newspapername').clear().type('My Paper').should('have.value', 'My Paper')
  })
})
