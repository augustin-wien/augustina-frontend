// Merges the zero-coverage baseline of every instrumented source file into the
// coverage collected by Cypress, so files no spec loads still count as 0 %.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createCoverageMap } = require('istanbul-lib-coverage')

const baselinePath = 'coverage-e2e-baseline.json'
const runPath = '.nyc_output/out.json'

const map = createCoverageMap(existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {})
if (existsSync(runPath)) map.merge(JSON.parse(readFileSync(runPath, 'utf8')))
mkdirSync('.nyc_output', { recursive: true })
writeFileSync(runPath, JSON.stringify(map.toJSON()))
