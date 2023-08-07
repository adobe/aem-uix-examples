/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import actions from './config.json';

/* global fetch */

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 * @returns {Promise<string|object>} the response
 */

/**
 * @param actionUrl
 * @param headers
 * @param params
 * @param options
 */
async function actionWebInvoke (actionUrl, headers = {}, params = {}, options = { method: 'POST' }) {
  const actionHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const fetchConfig = {
    headers: actionHeaders,
  };

  if (window.location.hostname === 'localhost') {
    actionHeaders['x-ow-extra-logging'] = 'on';
  }

  fetchConfig.method = options.method.toUpperCase();

  if (fetchConfig.method === 'GET') {
    actionUrl = new URL(actionUrl);
    Object.keys(params).forEach(key => actionUrl.searchParams.append(key, params[key]));
  } else if (fetchConfig.method === 'POST') {
    fetchConfig.body = JSON.stringify(params);
  }

  const response = await fetch(actionUrl, fetchConfig);

  let content = await response.text();

  if (!response.ok) {
    throw new Error(`failed request to '${actionUrl}' with status: ${response.status} and message: ${content}`);
  }
  try {
    content = JSON.parse(content);
  } catch (e) {
    // response is not json
  }
  return content;
}

/* Utils methods for manage translations (invoke backend actions) */

/**
 * @param fragmentPath
 * @param authConfig
 * @param aemHost
 */
async function getTranslations (cfPaths, authConfig, aemHost) {
  try {
    const translations = await actionWebInvoke(
      actions['get-translations'],
      {},
      {
        cfPaths: cfPaths,
        authConfig,
        aemHost,
      },
      { method: 'POST' }
    );
    console.log('Response from "get-translations" action:', JSON.stringify(translations));

    return translations || [];
  } catch (e) {
    console.error(e);

    return [];
  }
}

/**
 * @param selection
 * @param authConfig
 * @param aemHost
 */
async function quickPublishTranslations (selection, authConfig, aemHost) {
  console.log('Translations publishing: ', [...selection]);
  try {
    const res = await actionWebInvoke(
      actions['quick-publish-translations'],
      {},
      {
        selection: [...selection],
        authConfig,
        aemHost,
      },
      { method: 'POST' }
    );
    console.log('Response from "quick-publish-translations" action:', JSON.stringify(res));
  } catch (e) {
    console.error(e);
  }
}

/**
 * @param selection
 * @param authConfig
 * @param aemHost
 */
async function unPublishTranslations (selection, authConfig, aemHost) {
  console.log('Translations unpublishing: ', [...selection]);
  try {
    const res = await actionWebInvoke(
      actions['unpublish-translations'],
      {},
      {
        selection: [...selection],
        authConfig,
        aemHost,
      },
      { method: 'POST' }
    );
    console.log('Response from "unpublish-translations" action:', JSON.stringify(res));
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  actionWebInvoke,
  getTranslations,
  quickPublishTranslations,
  unPublishTranslations,
};
