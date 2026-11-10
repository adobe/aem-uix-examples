jest.mock('node-fetch', () => jest.fn())

const fetch = require('node-fetch')
const { main } = require('../src/aem-assets-assetsview-1/actions/core/inbox')

const origin = 'https://author-p210602-e2203931.adobeaemcloud.com'
const params = {
  hostname: `${origin}/`,
  __ow_headers: { authorization: 'Bearer test-token' }
}

beforeEach(() => {
  fetch.mockReset()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

test.each([origin, `${origin}/`, 'author-p210602-e2203931.adobeaemcloud.com'])(
  'fetches the inbox from %s and returns only WorkItems',
  async hostname => {
    const items = [{ uri: '/var/workflow/item', type: 'WorkItem' }, { type: 'Task' }, null, {}, { type: 'workitem' }]
    fetch.mockResolvedValueOnce({ ok: true, json: async () => items })
    const response = await main({ ...params, hostname })
    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: [items[0]]
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(`${origin}/bin/workflow/inbox`, {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token', Accept: 'application/json' },
      redirect: 'error',
      timeout: 10000
    })
  }
)

test('accepts a case-insensitive Authorization header and an empty inbox', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
  const response = await main({ ...params, __ow_headers: { Authorization: 'Bearer test-token' } })
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual([])
})

test('returns an empty array when the inbox has no WorkItems', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ type: 'Task' }] })
  const response = await main(params)
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual([])
})

test.each([
  undefined, '', 'http://author-p1-e1.adobeaemcloud.com', 'https://example.com',
  'https://author-p1-e1.adobeaemcloud.com.evil.test', 'https://localhost',
  `${origin}/some/path`, `${origin}:8080`, `${origin}?target=other`,
  'https://user:password@author-p1-e1.adobeaemcloud.com'
])('rejects invalid author %s before forwarding authorization', async hostname => {
  expect((await main({ ...params, hostname })).statusCode).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})

test.each([undefined, '', 'Basic test-token', 'Bearer ', 'Bearer test\r\nInjected: value'])(
  'rejects missing or invalid bearer authorization: %s',
  async authorization => {
    expect((await main({ ...params, __ow_headers: { authorization } })).statusCode).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
  }
)

test.each([403, 500])('reports upstream HTTP %s', async status => {
  fetch.mockResolvedValueOnce({ ok: false, status })
  const response = await main(params)
  expect(response.statusCode).toBe(502)
  expect(response.body.upstreamStatus).toBe(status)
  expect(console.error).toHaveBeenCalled()
})

test('rejects a malformed inbox response', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
  expect((await main(params)).statusCode).toBe(502)
  expect(console.error).toHaveBeenCalled()
})

test('reports network errors without disclosing upstream details', async () => {
  fetch.mockRejectedValueOnce(new Error('sensitive upstream details'))
  const response = await main(params)
  expect(response.statusCode).toBe(502)
  expect(JSON.stringify(response)).not.toContain('sensitive upstream details')
  expect(console.error).toHaveBeenCalled()
})

const itemPath = '/var/workflow/instances/server438/2026-09-08/expiry/workItems/node1'

test('returns item routes instead of fetching the inbox when item is supplied', async () => {
  const routes = {
    results: 1,
    routes: [
      { rid: 'retry-current-step', label: 'Current Step (Retry this step)' },
      { rid: '319010625', label: 'End' }
    ]
  }
  fetch.mockResolvedValueOnce({ ok: true, json: async () => routes })
  const response = await main({ ...params, item: itemPath })
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual(routes)
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledWith(`${origin}${itemPath}.routes.json`, {
    method: 'GET',
    headers: { Authorization: 'Bearer test-token', Accept: 'application/json' },
    redirect: 'error',
    timeout: 10000
  })
})

test.each([undefined, null, '', {}, '/content/dam/image.jpg', '//example.com/item',
  `${itemPath}/../other`, `${itemPath}?other=true`, `${itemPath}#fragment`,
  `${itemPath}/%2e%2e/other`, `${itemPath}\\other`, `${itemPath}\r\nheader`
])('rejects an invalid supplied item without fetching: %j', async item => {
  expect((await main({ ...params, item })).statusCode).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})

test('returns an explicit empty routes response', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [] }) })
  expect((await main({ ...params, item: itemPath })).body).toEqual({ routes: [] })
})

test.each([{}, [], { routes: [null] }, { routes: [{ rid: 'end' }] }])(
  'reports malformed routes: %j', async body => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => body })
    const response = await main({ ...params, item: itemPath })
    expect(response.statusCode).toBe(502)
    expect(response.body.error).toContain('routes')
    expect(console.error).toHaveBeenCalled()
  }
)

test('reports upstream route errors', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 403 })
  const response = await main({ ...params, item: itemPath })
  expect(response.statusCode).toBe(502)
  expect(response.body).toEqual({ error: 'AEM rejected the routes request.', upstreamStatus: 403 })
})

test('reports routes network failures without exposing upstream details', async () => {
  fetch.mockRejectedValueOnce(new Error('sensitive upstream details'))
  const response = await main({ ...params, item: itemPath })
  expect(response.statusCode).toBe(502)
  expect(response.body.error).toBe('Unable to complete the AEM routes request.')
  expect(JSON.stringify(response)).not.toContain('sensitive upstream details')
})

test('executes a route with form-encoded item and route, accepting a bodyless AEM success', async () => {
  fetch.mockResolvedValueOnce({ ok: true, status: 204 })
  const route = 'route & special=1'
  const response = await main({ ...params, item: itemPath, route })
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual({ message: 'Workflow route submitted successfully.', item: itemPath, route })
  expect(fetch).toHaveBeenCalledWith(`${origin}/bin/workflow/inbox`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer test-token',
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: new URLSearchParams({ item: itemPath, route }).toString(),
    redirect: 'error',
    timeout: 10000
  })
})

test.each([undefined, null, '', ' ', 123, 'end\r\nheader'])('rejects invalid route ID %j', async route => {
  expect((await main({ ...params, item: itemPath, route })).statusCode).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})

test('rejects route execution without an item', async () => {
  expect((await main({ ...params, route: 'end' })).statusCode).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})

test('reports route execution failures without returning success', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 403 })
  const response = await main({ ...params, item: itemPath, route: 'end' })
  expect(response.statusCode).toBe(502)
  expect(response.body).toEqual({ error: 'AEM rejected the route execution request.', upstreamStatus: 403 })
})
