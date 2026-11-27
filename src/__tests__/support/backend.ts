import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { apiInstance } from '@/api/api'
import * as f from './fixtures'

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
type Responder = unknown | ((config: InternalAxiosRequestConfig) => unknown)

interface Route {
  method: Method
  pattern: RegExp
  status: number
  respond: Responder
}

export interface RecordedRequest {
  method: Method
  url: string
  params: unknown
  data: unknown
}

const defaults = (): Route[] =>
  [
    ['get', /api\/settings\/admin\/$/, f.settingsResponse()],
    ['get', /api\/settings\/$/, f.settingsResponse()],
    ['get', /public\/style\.css/, 'body { color: red }'],
    ['get', /api\/vendors\/me\/$/, f.vendor()],
    ['get', /api\/vendors\/check\/[^/]+\/steckbrief\/$/, steckbrief()],
    ['get', /api\/vendors\/check\/[^/]+\/$/, { FirstName: 'Anna', AccountProofUrl: '' }],
    ['get', /api\/vendors\/statistics\//, vendorStatistics()],
    ['get', /api\/vendors\/\d+\/steckbrief\/$/, { VendorID: 1, ...steckbrief() }],
    ['get', /api\/vendors\/\d+\/locations\/$/, [f.vendorLocation()]],
    ['get', /api\/vendors\/\d+\/comments\/$/, [f.vendorComment()]],
    ['get', /api\/vendors\/[^/]+\/pos-orders\/$/, []],
    ['get', /api\/vendors\/\d+\/$/, f.vendor()],
    ['get', /api\/vendors\/$/, f.vendors()],
    ['get', /api\/items\/licensegroups\/$/, ['digital_edition', 'analog_edition']],
    ['get', /api\/items\/wordpress-issue\//, wordPressIssue()],
    [
      'get',
      /api\/items\/\d+\/notify-abonements\/$/,
      { Counts: {}, Total: 0, FirstQueuedAt: null, LastSentAt: null }
    ],
    ['get', /api\/items\/(backoffice\/|archived\/)?$/, f.items()],
    [
      'get',
      /api\/locations\/$/,
      [f.locationOverview(), f.locationOverview({ id: 2, vendorID: null })]
    ],
    ['get', /api\/map\/$/, mapLocations()],
    ['get', /api\/payments\/statistics\//, f.statistics()],
    ['get', /api\/payments\/forpayout\//, { payments: [f.payment()], balance: 800 }],
    ['get', /api\/payments\//, [f.payment(), f.payment({ ID: 2, Item: 3, Amount: 30 })]],
    ['get', /api\/orders\/statistics\//, { Started: 10, Completed: 7, Abandoned: 2, Open: 1 }],
    ['get', /api\/orders\/unverified\/$/, [f.order()]],
    ['get', /api\/orders\/verified\//, [f.order({ ID: 2, VerifiedAt: '2026-10-01T10:05:00Z' })]],
    ['get', /api\/reports\/last\/$/, { To: '2026-10-01T00:00:00Z' }],
    ['get', /api\/reports\//, { Items: [], Vendors: [] }],
    ['get', /api\/mail-templates\/[^/]+\/$/, mailTemplate()],
    ['get', /api\/mail-templates\/$/, [mailTemplate()]],
    ['get', /api\/mail-tasks\/\d+\/$/, mailTask()],
    ['get', /api\/mail-tasks\//, { tasks: [mailTask()], total: 1 }],
    ['get', /api\/customers\/\d+\/abonements\/$/, [f.abonement()]],
    ['get', /api\/customers\/\d+\/$/, f.customer()],
    ['get', /api\/customers\/$/, [f.customer(), f.customer({ id: 2, email: 'b@example.org' })]],
    ['get', /api\/abonements\//, [f.abonement()]],
    ['get', /api\/campaigns\/active\/$/, []],
    ['get', /api\/campaigns\/$/, [f.campaign(), f.campaign({ id: 2, enabled: false })]],
    ['get', /api\/vouchers\/$/, []],
    ['get', /api\/pos-orders\//, []],
    ['get', /api\/external-payments\//, []],
    ['get', /api\/pdf\//, { valid: true }],
    ['get', /api\/auth\/hello\/$/, 'hello']
  ].map(([method, pattern, respond]) => ({
    method: method as Method,
    pattern: pattern as RegExp,
    status: 200,
    respond
  }))

export function wordPressIssue() {
  return {
    configured: true,
    ok: true,
    message: 'Ausgabe gefunden',
    issue: { exists: true, issue_number: '600', published: true, is_demo: false }
  }
}

export function steckbrief() {
  return {
    FirstName: 'Anna',
    LastName: 'Muster',
    LicenseID: 'AUG-1',
    Image: '/img/anna.jpg',
    Description: 'Ich verkaufe seit 2020.',
    Family: 'Zwei Kinder',
    Residence: 'Wien',
    Education: 'Lehre',
    CareerGoal: 'Köchin',
    Support: 'Deutschkurs'
  }
}

export function vendorStatistics() {
  return {
    From: '2026-10-01',
    To: '2026-10-31',
    TotalVendors: 3,
    UsedVendors: 1,
    UnusedVendors: 2,
    UsedPercentage: 33.3,
    UnusedPercentage: 66.7
  }
}

export function mapLocations() {
  return [
    {
      firstName: 'Anna',
      latitude: 48.21,
      licenseID: 'AUG-1',
      longitude: 16.38,
      id: 1,
      locationID: 1,
      locationName: 'Billa',
      address: 'Praterstraße 1',
      hasVendor: true
    }
  ]
}

export function mailTemplate() {
  return { name: 'welcome', subject: 'Willkommen', body: '<p>Hallo {{.Name}}</p>' }
}

export function mailTask() {
  return {
    id: 1,
    type: 'order_confirmation',
    status: 'failed',
    recipient: 'kunde@example.org',
    attempts: 3,
    last_error: 'smtp timeout',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:05:00Z'
  }
}

let routes: Route[] = []

export const requests: RecordedRequest[] = []

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response: AxiosResponse = {
    data,
    status,
    statusText: String(status),
    headers: new AxiosHeaders({ 'x-request-id': 'req-1' }),
    config
  }

  if (status >= 400) {
    return Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        'ERR_BAD_RESPONSE',
        config,
        {},
        response
      )
    )
  }

  return Promise.resolve(response)
}

let interceptorInstalled = false

// The adapter only sees the serialized body; the form helpers turn objects into multipart bodies
// that cannot be read back, so the body is recorded before axios transforms it
function recordRawBody() {
  if (interceptorInstalled) return
  interceptorInstalled = true

  apiInstance.interceptors.request.use((config) => {
    ;(config as { rawData?: unknown }).rawData = config.data
    return config
  })
}

/** Points apiInstance at an in-memory backend and resets it to the default responses. */
export function installBackend() {
  recordRawBody()

  routes = defaults()
  requests.length = 0

  apiInstance.defaults.adapter = (config) => {
    const method = (config.method ?? 'get').toLowerCase() as Method
    const url = config.url ?? ''

    const raw = (config as { rawData?: unknown }).rawData

    requests.push({
      method,
      url,
      params: config.params,
      data: raw === undefined ? config.data : raw
    })

    const route = routes.find((r) => r.method === method && r.pattern.test(url))

    if (!route) {
      return respond(config, 200, method === 'get' ? [] : {})
    }

    const data = typeof route.respond === 'function' ? route.respond(config) : route.respond

    return respond(config, route.status, structuredClone(data))
  }
}

/** Overrides the response for requests matching method and pattern; newest override wins. */
export function on(method: Method, pattern: RegExp, respond: Responder, status = 200) {
  routes.unshift({ method, pattern, respond, status })
}

/** Makes requests matching method and pattern fail with the given status. */
export function fail(method: Method, pattern: RegExp, status = 500, data: unknown = 'error') {
  on(method, pattern, data, status)
}

export const requested = (method: Method, pattern: RegExp) =>
  requests.filter((r) => r.method === method && pattern.test(r.url))
