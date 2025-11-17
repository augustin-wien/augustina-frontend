import { mount } from '@cypress/vue'
import { createPinia } from 'pinia'

// add custom mount that installs pinia by default
Cypress.Commands.add('mount', (component: any, options = {}) => {
  const pinia = createPinia()
  const global = options.global || {}
  global.plugins = global.plugins || []
  global.plugins.push(pinia)
  // provide a minimal $t implementation so components using i18n work in tests
  global.config = global.config || {}
  global.config.globalProperties = global.config.globalProperties || {}

  if (!global.config.globalProperties.$t) {
    global.config.globalProperties.$t = (key: string) => key
  }

  options.global = global
  return mount(component, options)
})

// re-export everything
export * from '@cypress/vue'

// default mounting for specs can be imported
