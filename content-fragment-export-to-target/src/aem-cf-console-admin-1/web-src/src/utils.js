/*
* <license header>
*/
import allActions from './config.json'

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

async function actionWebInvoke (actionUrl, authToken, params = {}, options = { method: 'POST' }) {
  const actionHeaders = {
    'Content-Type': 'application/json',
    authorization: `Bearer ${authToken}`
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

  const resp = await fetch(actionUrl, fetchConfig)
  if (!resp.ok) {
    throw new Error(
      'Request to ' + actionUrl + ' failed with status code ' + resp.status
    )
  }

  const data = await resp.json()
  return data
}

const getActionUrl = (action) => {
  return allActions[action]
}

export const triggerExportToAdobeTarget = async (authToken, aemHost, imsOrg, paths = [], publish = false) => {
  return await actionWebInvoke(getActionUrl('export'), authToken, {
    aemHost: 'https://' + aemHost,
    imsOrg,
    paths
  })
}

export const triggerDeleteFromAdobeTarget = async (authToken, aemHost, imsOrg, paths = []) => {
  return await actionWebInvoke(getActionUrl('delete'), authToken, {
    aemHost: 'https://' + aemHost,
    imsOrg,
    paths
  })
}

export const triggerPublish = async (authToken, aemHost, imsOrg, paths = []) => {
  /** @todo  check if we can use API here and update column text */
  return await actionWebInvoke(getActionUrl('publish'), authToken, {
    aemHost: 'https://' + aemHost,
    imsOrg,
    paths
  })
}
