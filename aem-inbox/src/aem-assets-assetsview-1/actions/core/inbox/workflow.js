const fetch = require('node-fetch')
const jsonResponse = require('./response')

async function requestWorkflow ({ author, authorization, item, route, isRouteExecution, isRoutesRequest, requestName }) {
  try {
    const path = isRoutesRequest && !isRouteExecution ? `${item}.routes.json` : '/bin/workflow/inbox'
    const response = await fetch(`${author.origin}${path}`, {
      method: isRouteExecution ? 'POST' : 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
        ...(isRouteExecution ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {})
      },
      ...(isRouteExecution ? { body: new URLSearchParams({ item, route }).toString() } : {}),
      redirect: 'error',
      timeout: 10000
    })
    if (!response.ok) {
      console.error(`${requestName} request failed:`, response.status)
      return jsonResponse(502, { error: `AEM rejected the ${requestName.toLowerCase()} request.`, upstreamStatus: response.status })
    }
    if (isRouteExecution) {
      return jsonResponse(200, { message: 'Workflow route submitted successfully.', item, route })
    }
    const items = await response.json()
    if (isRoutesRequest) {
      if (!items || !Array.isArray(items.routes) ||
          !items.routes.every(route => route && typeof route.rid === 'string' && typeof route.label === 'string')) {
        console.error('Routes request returned an invalid response.')
        return jsonResponse(502, { error: 'The AEM routes API returned an invalid response.' })
      }
      return jsonResponse(200, items)
    }
    if (!Array.isArray(items)) {
      console.error('Inbox request returned an invalid response: expected an array.')
      return jsonResponse(502, { error: 'The AEM inbox returned an invalid response.' })
    }
    return jsonResponse(200, items.filter(item => item && item.type === 'WorkItem'))
  } catch {
    console.error(`${requestName} request failed due to a network error or invalid AEM response.`)
    return jsonResponse(502, { error: `Unable to complete the AEM ${requestName.toLowerCase()} request.` })
  }
}

module.exports = requestWorkflow
