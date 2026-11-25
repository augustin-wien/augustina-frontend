const tasks = [
  {
    ID: 1,
    Kind: 'online_issue',
    Recipients: ['sent@example.com'],
    Subject: 'Neue Ausgabe',
    HasAttachments: false,
    Status: 'sent',
    Attempts: 1,
    LastError: '',
    NextAttemptAt: '2026-01-01T10:00:00Z',
    CreatedAt: '2026-01-01T10:00:00Z',
    UpdatedAt: '2026-01-01T10:05:00Z',
    SentAt: '2026-01-01T10:05:00Z',
    OrderID: null,
    ItemID: 5
  },
  {
    ID: 2,
    Kind: 'welcome',
    Recipients: ['failed@example.com', 'second@example.com'],
    Subject: 'Willkommen',
    HasAttachments: true,
    Status: 'failed',
    Attempts: 3,
    LastError: 'connection refused',
    NextAttemptAt: '2026-01-02T10:00:00Z',
    CreatedAt: '2026-01-01T09:00:00Z',
    UpdatedAt: '2026-01-02T09:00:00Z',
    SentAt: null,
    OrderID: 7,
    ItemID: null
  },
  {
    ID: 3,
    Kind: 'unknown_kind',
    Recipients: ['pending@example.com'],
    Subject: 'Wartet',
    HasAttachments: false,
    Status: 'pending',
    Attempts: 0,
    LastError: '',
    NextAttemptAt: '2026-01-03T10:00:00Z',
    CreatedAt: '2026-01-03T09:00:00Z',
    UpdatedAt: '2026-01-03T09:00:00Z',
    SentAt: null,
    OrderID: null,
    ItemID: null
  }
]

function stubMailTasks() {
  cy.intercept('GET', '**/api/mail-tasks/?*', {
    statusCode: 200,
    body: { Tasks: tasks, Total: 120, Counts: { sent: 1, failed: 1, pending: 1 } }
  }).as('mailTasks')
  cy.intercept('GET', '**/api/mail-tasks/', {
    statusCode: 200,
    body: { Tasks: tasks, Total: 3, Counts: { sent: 1, failed: 1, pending: 1 } }
  }).as('mailTasks')
  cy.intercept('GET', '**/api/mail-tasks/*/', { statusCode: 200, body: { ...tasks[1], Body: 'Text der Mail' } })
  cy.intercept('POST', '**/api/mail-tasks/*/retry/', { statusCode: 200, body: {} }).as('retry')
  cy.intercept('POST', /\/api\/mail-tasks\/retry-failed\//, { statusCode: 200, body: {} }).as('retryFailed')
}

describe('Mail tasks', () => {
  it('filters, pages and retries mail tasks', () => {
    stubMailTasks()
    cy.loginBackoffice('/backoffice/mails')
    cy.get('tbody tr').should('have.length.gte', 3)

    cy.get('select').first().select(1)
    cy.get('select').first().select(0)
    cy.get('.search-form input').type('failed{enter}')
    cy.get('.search-form input').clear()
    cy.get('.search-form button').click()

    cy.get('[data-test="status-failed"]').click()
    cy.get('[data-test="status-pending"]').click()
    cy.get('.status-tab').first().click()

    cy.get('.pagination button').last().click()
    cy.url().should('include', 'page=2')
    cy.get('.pagination button').first().click()
  })

  it('opens the detail of a mail and retries it', () => {
    stubMailTasks()
    cy.loginBackoffice('/backoffice/mails')
    cy.contains('tbody .link-btn', 'Willkommen').click()
    cy.get('.aug-modal:visible').should('contain', 'connection refused')
    cy.get('.aug-modal:visible').contains('button', 'Jetzt senden').click()
    cy.wait('@retry')
  })

  it('retries all failed mail tasks and a sent one', () => {
    stubMailTasks()
    cy.loginBackoffice('/backoffice/mails')
    cy.get('tbody tr').should('have.length.gte', 3)
    cy.get('[data-test="retry-all-failed"]').click()
    cy.wait('@retryFailed')
    cy.window().then((win) => cy.stub(win, 'confirm').returns(true))
    cy.get('[data-test="retry-1"]').click()
    cy.wait('@retry')
  })

  it('opens a pre-filtered list from a link', () => {
    stubMailTasks()
    cy.loginBackoffice('/backoffice/mails?item_id=5&kind=online_issue&order_id=7&status=failed&page=2')
    cy.get('tbody tr').should('have.length.gte', 1)
    cy.get('.filter-chip button').first().click()
    cy.get('.filter-chip button').first().click()
  })
})

const vouchers = [
  {
    ID: 1,
    Code: 'AAAA-1111',
    ItemID: 5,
    ItemName: 'Geschenkabo',
    OrderID: 3,
    BuyerEmail: 'buyer@example.com',
    RecipientName: 'Maria',
    Message: 'Alles Gute',
    DurationMonths: 6,
    Status: 'active',
    CreatedAt: '2026-01-01T10:00:00Z',
    RedeemedAt: null,
    RedeemedEmail: null,
    RedeemedCustomerID: null,
    AbonementID: null
  },
  {
    ID: 2,
    Code: 'BBBB-2222',
    ItemID: 5,
    ItemName: 'Geschenkabo',
    OrderID: 4,
    BuyerEmail: 'other@example.com',
    RecipientName: 'Peter',
    Message: '',
    DurationMonths: 12,
    Status: 'redeemed',
    CreatedAt: '2026-01-02T10:00:00Z',
    RedeemedAt: '2026-02-01T10:00:00Z',
    RedeemedEmail: 'redeemer@example.com',
    RedeemedCustomerID: 9,
    AbonementID: 11
  },
  {
    ID: 3,
    Code: 'CCCC-3333',
    ItemID: 5,
    ItemName: 'Geschenkabo',
    OrderID: null,
    BuyerEmail: 'third@example.com',
    RecipientName: '',
    Message: '',
    DurationMonths: 3,
    Status: 'disabled',
    CreatedAt: '2026-01-03T10:00:00Z',
    RedeemedAt: null,
    RedeemedEmail: null,
    RedeemedCustomerID: null,
    AbonementID: null
  }
]

describe('Vouchers', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/vouchers/', { statusCode: 200, body: vouchers })
    cy.intercept('GET', '**/api/vouchers/*/pdf/', { statusCode: 200, body: 'pdf' }).as('pdf')
    cy.intercept('POST', '**/api/vouchers/*/resend/', { statusCode: 200, body: {} }).as('resend')
    cy.intercept('POST', '**/api/vouchers/*/disable/', {
      statusCode: 200,
      body: { ...vouchers[0], Status: 'disabled' }
    }).as('disable')
    cy.intercept('POST', '**/api/vouchers/*/enable/', {
      statusCode: 200,
      body: { ...vouchers[2], Status: 'active' }
    }).as('enable')
  })

  it('searches the vouchers', () => {
    cy.loginBackoffice('/backoffice/vouchers')
    cy.get('tbody tr').should('have.length', 3)
    cy.get('input').first().type('BBBB')
    cy.get('tbody tr').should('have.length', 1)
    cy.get('input').first().clear().type('redeemer@')
    cy.get('tbody tr').should('have.length', 1)
    cy.get('input').first().clear().type('maria')
    cy.get('tbody tr').should('have.length', 1)
    cy.get('input').first().clear().type('does-not-exist')
    cy.get('tbody tr').should('have.length.lte', 1)
  })

  it('opens the PDF, resends, disables and enables a voucher', () => {
    cy.loginBackoffice('/backoffice/vouchers')
    cy.get('tbody tr').should('have.length', 3)
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open')
      cy.stub(win, 'prompt').returns('new@example.com')
      cy.stub(win, 'confirm').returns(true)
    })
    cy.contains('tr', 'AAAA-1111').contains('button', 'PDF').click()
    cy.wait('@pdf')
    cy.contains('tr', 'AAAA-1111').find('button').eq(1).click()
    cy.wait('@resend')
    cy.contains('tr', 'AAAA-1111').find('button').last().click()
    cy.wait('@disable')
    cy.contains('tr', 'CCCC-3333').find('button').last().click()
    cy.wait('@enable')
  })
})

describe('Unverified orders', () => {
  const orders = [
    {
      ID: 1,
      OrderCode: '1111111111',
      Vendor: 3,
      TransactionID: '',
      PaymentEventID: 10006,
      PaymentFailedAt: '2026-01-01T10:00:00Z',
      ReconcileError: 'amount differs',
      ReconcileFailedAt: '2026-01-01T11:00:00Z',
      Timestamp: '2026-01-01T09:00:00Z',
      CustomerEmail: 'customer@example.com',
      Entries: [
        { Price: 300, Quantity: 2, Sender: 1, Receiver: 3, SenderName: 'x', ReceiverName: 'fl-123' }
      ]
    },
    {
      ID: 2,
      OrderCode: '2222222222',
      Vendor: 4,
      TransactionID: 'abc',
      PaymentEventID: null,
      Timestamp: '2026-01-02T09:00:00Z',
      CustomerEmail: 'other@example.com',
      Entries: []
    }
  ]

  it('verifies an order, adds a transaction id and handles errors', () => {
    cy.intercept('GET', '**/api/orders/unverified/', { statusCode: 200, body: orders })
    cy.intercept('GET', '**/api/orders/unverified/code/1111111111/verify/', {
      statusCode: 200,
      body: {}
    }).as('verifyOk')
    cy.intercept('GET', '**/api/orders/unverified/code/2222222222/verify/', {
      statusCode: 400,
      body: { error: { message: 'nicht bezahlt' } }
    }).as('verifyFail')
    cy.intercept('POST', '**/api/orders/unverified/code/*/transactionID/', {
      statusCode: 200,
      body: {}
    }).as('addTransaction')

    cy.loginBackoffice('/backoffice/unverified-orders')
    cy.get('tbody tr').should('have.length', 2)
    cy.get('tbody tr').first().should('contain', 'amount differs')

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('TX-123')
    })
    cy.get('tbody tr').first().find('button').first().click()
    cy.wait('@verifyOk')
    cy.get('tbody tr').eq(1).find('button').first().click()
    cy.wait('@verifyFail')
    cy.get('.toast').should('contain', 'nicht bezahlt')
    cy.get('tbody tr').first().find('button').eq(1).click()
    cy.wait('@addTransaction')
  })

  it('shows the empty list', () => {
    cy.intercept('GET', '**/api/orders/unverified/', { statusCode: 200, body: [] })
    cy.loginBackoffice('/backoffice/unverified-orders')
    cy.get('tbody tr').should('have.length', 1)
  })
})

describe('Scan an ID card', () => {
  it('handles unknown, broken and known cards', () => {
    cy.intercept('GET', '**/api/settings/', (req) => {
      req.continue((res) => {
        res.body.IDScanEnabled = true
      })
    })
    cy.intercept('POST', '**/api/vendors/nobody-123/id-scan/', { statusCode: 404, body: {} })
    cy.intercept('POST', '**/api/vendors/broken-1/id-scan/', { statusCode: 500, body: {} })
    cy.intercept('POST', '**/api/vendors/fl-123/id-scan/', { statusCode: 200, body: { ID: 1 } })

    cy.loginBackoffice('/backoffice/scan-id')
    cy.get('#id-scan-input').type('nobody-123{enter}')
    cy.get('#id-scan-input').should('have.value', '')
    cy.get('#id-scan-input').type('broken-1{enter}')
    cy.get('#id-scan-input').should('have.value', '')
    cy.get('#id-scan-input').type('fl-123{enter}')
    cy.url().should('include', '/backoffice/userprofile/1')
  })
})
