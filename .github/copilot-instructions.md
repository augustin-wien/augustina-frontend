# Copilot Instructions for Augustina Frontend

This repository contains the frontend for the Augustina bargeldlos (cashless) project - a Vue 3 + TypeScript application built with Vite.

## Project Overview

Augustina is a cashless payment system for street newspaper vendors. The frontend provides:
- Customer-facing payment flow (QR code scanning, item selection, payment processing via Vivawallet)
- Vendor profile management
- Back-office administration dashboard
- Map-based vendor location views

## Tech Stack

- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite
- **State Management**: Pinia stores
- **Routing**: Vue Router
- **Styling**: Tailwind CSS, SCSS
- **Internationalization**: vue-i18n (German and English locales)
- **Icons**: FontAwesome
- **Maps**: Leaflet + Vue Leaflet
- **HTTP Client**: Axios
- **Authentication**: Keycloak
- **Testing**: Vitest (unit), Cypress (e2e)

## Package Manager

Use **Yarn** for all package operations:
```bash
yarn install          # Install dependencies
yarn dev              # Development server
yarn build            # Production build (includes type-check)
yarn test:unit        # Run Vitest tests
yarn test:e2e         # Run Cypress e2e tests
yarn lint             # ESLint check
yarn lint:fix         # Auto-fix lint issues
yarn format           # Prettier check
yarn format:fix       # Auto-fix formatting
yarn depcheck         # Check for unused dependencies
```

## Code Style & Conventions

### TypeScript
- Use strict TypeScript typing; avoid `any` when possible
- Define interfaces/types for all data structures
- Use type imports: `import type { Item } from './items'`

### Vue Components
- Use Composition API with `<script setup lang="ts">`
- Component order: `<script>`, `<template>`, `<style>`
- Use `defineProps()` and `defineEmits()` for component interfaces
- Prefer `ref()` and `reactive()` for reactive state

### Formatting (Prettier)
- No semicolons
- Single quotes
- 2-space indentation
- 100 character print width
- No trailing commas

### ESLint Rules
- No `console.log` (use `console.warn` or remove in production)
- No `debugger` statements
- Prefer `const` over `let`
- Use explicit Vue component emits
- Require blank lines between code blocks

## Project Structure

```
src/
├── api/              # API client and endpoints
├── assets/           # Static assets and styles
├── components/       # Reusable Vue components
│   ├── icons/        # Icon components
│   └── settings/     # Settings-related components
├── keycloak/         # Keycloak authentication
├── layouts/          # Page layouts
├── locales/          # i18n translation files (de.json, en.json)
├── models/           # TypeScript interfaces/types
├── router/           # Vue Router configuration
├── stores/           # Pinia state stores
├── utils/            # Utility functions
└── views/            # Page components
    └── backoffice/   # Admin dashboard views
```

## Pinia Stores

Stores follow the Options API pattern with:
- `state()` function returning initial state
- `getters` for computed values
- `actions` for methods that modify state

Example pattern:
```typescript
export const useExampleStore = defineStore('example', {
  state: () => ({
    items: [] as Item[],
  }),
  getters: {
    itemCount: (state) => state.items.length,
  },
  actions: {
    async fetchItems() {
      // Implementation
    },
  },
})
```

## API Integration

- API calls are in `src/api/api.ts`
- Endpoints are defined in `src/api/endpoints.ts`
- Use the configured Axios instance from `src/api/agent.ts`
- Environment variable `VITE_API_URL` defines the backend URL

## Internationalization

- Add translations to both `src/locales/de.json` and `src/locales/en.json`
- Use `$t('key')` in templates
- Use `useI18n()` composable in script setup for programmatic access

## Environment Variables

Environment variables must be prefixed with `VITE_`:
- `VITE_API_URL` - Backend API URL
- `VITE_SENTRY_DSN` - Sentry/Glitchtip DSN (optional)

## Testing

### Unit Tests (Vitest)
- Located alongside source files or in `__tests__` directories
- Use `.spec.ts` or `.test.ts` extensions

### E2E Tests (Cypress)
- Located in `cypress/e2e/`
- Use `.cy.ts` extensions
- Run against development server on port 4173

## Common Patterns

### Async Data Loading
```typescript
onMounted(async () => {
  await store.fetchData()
})
```

### Conditional Rendering
Use `v-if`/`v-else` for conditional rendering, `v-show` for frequent toggles.

### Event Handling
Use `@click`, `@input`, etc. with methods or inline handlers.

### Props Validation
```typescript
const props = defineProps<{
  vendor: Vendor
  isActive?: boolean
}>()
```

## Important Notes

1. This project uses Vue 3 Composition API exclusively - do not use Options API in new code
2. Always run `yarn lint` and `yarn format` before committing
3. The backend repository is at https://github.com/augustin-wien/augustina-backend/
4. For local development with Vivawallet, manual URL adjustment is required (see README)
