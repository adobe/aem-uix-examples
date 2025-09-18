/*
* <license header>
*/

/* global fetch */

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */

async function actionWebInvoke (actionUrl, headers = {}, params = {}, options = { method: 'POST' }) {
  const actionHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  const fetchConfig = {
    headers: actionHeaders
  }

  if (window.location.hostname === 'localhost') {
    actionHeaders['x-ow-extra-logging'] = 'on'
  }

  fetchConfig.method = options.method.toUpperCase()

  if (fetchConfig.method === 'GET') {
    actionUrl = new URL(actionUrl)
    Object.keys(params).forEach(key => actionUrl.searchParams.append(key, params[key]))
  } else if (fetchConfig.method === 'POST') {
    fetchConfig.body = JSON.stringify(params)
  }

  const response = await fetch(actionUrl, fetchConfig)

  let content = await response.text()

  if (!response.ok) {
    return JSON.parse(content)
  }
  try {
    content = JSON.parse(content)
  } catch (e) {
    // response is not json
  }
  return content
}

/**
 * Fetches asset metadata from AEM Assets Author API
 * 
 * @param {object} guestConnection - The UIX guest connection object
 * @param {string} aemHost - The AEM host URL
 * @param {string} assetId - The asset ID to fetch metadata for
 * @returns {Promise<object>} The asset metadata
 */
async function getAssetMetadata(guestConnection, aemHost, assetId) {
  // Import config to get the action URL
  const config = await import('./config.json')
  const actionUrl = config['aem-assets-browse-1/fetchMetadata']
  
  // Get authentication info from guest connection
  const { accessToken } = await guestConnection.host.auth.getIMSInfo()
  
  // Set up headers with Bearer token
  const headers = {
    'Authorization': `Bearer ${accessToken}`
  }
  
  // Set up parameters
  const params = {
    assetId,
    AEMhost: aemHost,
  }
  
  // Set up options for GET request
  const options = {
    method: 'GET'
  }
  
  // Call the fetchMetadata action
  return await actionWebInvoke(actionUrl, headers, params, options)
}

export { getAssetMetadata }
export default actionWebInvoke
