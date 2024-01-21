/*
* <license header>
*/

/* global fetch */
import actions from './config.json'
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
 * @param aemHost
 * @param fragmentIds
 * @param authConfig
 */
async function getContentFragmentsInfo(aemHost, fragmentIds, authConfig) {
  try {
    const fragmentsInfo = await actionWebInvoke(
      actions['get-cf-info'],
      {},
      {
        aemHost,
        fragmentIds: fragmentIds,
        authConfig
      }
    );
    console.log('Response from "get-cf-info" action: ', JSON.stringify(fragmentsInfo));
    return fragmentsInfo || [];
  } catch(e) {
    console.error(e);
    return []
  }
}

module.exports = {
  actionWebInvoke,
  getContentFragmentsInfo,
}
