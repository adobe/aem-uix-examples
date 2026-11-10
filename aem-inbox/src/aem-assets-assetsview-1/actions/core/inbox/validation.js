const jsonResponse = require('./response')

function validateRequest (params) {
  const { hostname, item, route } = params
  const isRouteExecution = Object.prototype.hasOwnProperty.call(params, 'route')
  const isRoutesRequest = Object.prototype.hasOwnProperty.call(params, 'item')
  if (isRouteExecution && (!isRoutesRequest || typeof route !== 'string' || !route.trim() || /[\r\n]/.test(route))) {
    return jsonResponse(400, { error: 'A route ID and item path are required to execute a route.' })
  }
  if (isRoutesRequest && (typeof item !== 'string' || !item.startsWith('/var/workflow/instances/') ||
      !item.includes('/workItems/') || /[\s\\%?#]/.test(item) ||
      item.split('/').some(segment => segment === '.' || segment === '..'))) {
    return jsonResponse(400, { error: 'item must be an absolute workflow work item path under /var/workflow/instances/.' })
  }
  const requestName = isRouteExecution ? 'Route execution' : isRoutesRequest ? 'Routes' : 'Inbox'

  let author
  try {
    author = new URL(typeof hostname === 'string' && !hostname.includes('://') ? `https://${hostname}` : hostname)
  } catch {
    return jsonResponse(400, { error: 'hostname must be an HTTPS AEM Cloud author hostname or origin.' })
  }
  if (author.protocol !== 'https:' || !/^author-[a-z0-9-]+\.adobeaemcloud\.com$/.test(author.hostname) ||
      author.username || author.password || author.port || author.pathname !== '/' || author.search || author.hash) {
    return jsonResponse(400, { error: 'hostname must be an HTTPS AEM Cloud author hostname or origin.' })
  }

  const headers = params.__ow_headers || {}
  const authorizationKey = Object.keys(headers).find(key => key.toLowerCase() === 'authorization')
  const authorization = headers[authorizationKey]
  if (typeof authorization !== 'string' || !/^Bearer \S+$/i.test(authorization) || /[\r\n]/.test(authorization)) {
    return jsonResponse(401, { error: 'A Bearer Authorization header is required.' })
  }

  return { author, authorization, item, route, isRouteExecution, isRoutesRequest, requestName }
}

module.exports = validateRequest