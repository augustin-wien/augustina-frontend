# Augustin-bargeldlos-frontend

This repository contains the frontend for the Augustin bargeldlos project. It is based on [Vite](https://vitejs.dev/) and [Vue 3](https://v3.vuejs.org/).
See the [backend repository](https://github.com/augustin-wien/augustin-backend/) on how-to get started.

## Development Setup

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

#### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.


## Project Setup
Install [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/) and run the following commands:

```sh
yarn install
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
yarn test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
yarn build
yarn test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

### Disable CORS for local testing (Google Chrome / Windows)

```sh
cd c:\'Program Files'\Google\Chrome\Application
.\chrome.exe --user-data-dir="C://chrome-dev-disabled-security" --disable-web-security --disable-site-isolation-trials
```

## Keycloak Setup
please use the [Keycloak Setup provided by the backend](https://github.com/augustin-wien/augustin-backend/#keycloak)

## Vivawallet local testing
vivawallet checkout will redirect the user to https://www.local.com/success?t={TRANSACTION_ID}&s=4101073583353389&lang=en-GB&eventId=0&eci=1
To test the validation locally the programmer must manually change the url in the browser to http://localhost:5137/success?t={TRANSACTION_ID}&s=4101073583353389&lang=en-GB&eventId=0&eci=1

## Build and run in a docker container

For building and running the frontend in a docker container, use the following commands:
```sh
docker build . -t augustin/augustin-frontend

docker run --rm -p  8060:80 -e VITE_API_URL=http://localhost:3000/ -e VITE_KEYCLOAK_URL=http://keycloak:8080/ augustin/augustin-frontend

```
Note: the container will be removed after it is stopped. If you want to keep it, remove the `--rm` flag.