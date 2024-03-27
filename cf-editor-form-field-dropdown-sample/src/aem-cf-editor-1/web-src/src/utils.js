/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import allActions from './config.json'

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
    'authorization': `Bearer ${authToken}`,
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

  const resp = await fetch(actionUrl, fetchConfig);
  if (!resp.ok) {
    throw new Error(
      'Request to ' + actionUrl + ' failed with status code ' + resp.status
    );
  }

  const data = await resp.json();
  return data;
}

const getActionUrl = (action) => {
  return allActions[action];
}

export const getDropdownData = async (authToken, aemHost, imsOrg, path, searchParams) => {
  return await actionWebInvoke(getActionUrl("dropdown-data"), authToken, {
    aemHost: `https://${aemHost}`,
    path,
    imsOrg,
    searchParams
  });
}
