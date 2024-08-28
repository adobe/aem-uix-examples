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

const fetch = require('node-fetch');

/* Functions for manage translations (invoke aem host API points) */

/**
 * @param params
 * @param logger
 */
async function getTranslations (params, logger) {
  const apiEndpoint = `https://${params.aemHost}${params.HOST_INSTANCE_ENTRY_POINT_TRANSLATIONS}`;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + params.authConfig.imsToken,
    },
    body: JSON.stringify({
      paths: params.cfPaths,
    }),
  });

  if (!response.ok) {
    throw new Error(
      'request to ' + apiEndpoint + ' failed with status code ' + response.status
    );
  }
  const data = await response.json();

  const languageCopiesSet = new Set();
  const result = data.items
      .flatMap((item) => item.languageCopies)
      .filter((languageCopy) => !languageCopiesSet.has(languageCopy.path) && languageCopiesSet.add(languageCopy.path));
  return result;
}

/**
 * @param params
 * @param logger
 */
async function quickPublishTranslations (params, logger) {
  for (let i = 0; i < params.selection.length; i++) {
    const apiEndpoint = `https://${params.aemHost}${params.HOST_INSTANCE_ENTRY_POINT_QUICK_PUBLISH}` +
        `&path=${encodeURIComponent(params.selection[i])}`;
    logger.info(`Request to ${apiEndpoint}`);

    const res = await fetch(apiEndpoint, {
      method: 'post',
      // body: JSON.stringify({
      //   path: encodeURIComponent(params.selection[i]),
      // }),
      headers: {
        Authorization: 'Bearer ' + params.authConfig.imsToken,
      },
    });
    if (!res.ok) {
      logger.error(res);
      throw new Error(
        'request to ' + apiEndpoint + ' failed with status code ' + res.status
      );
    }
    await res.text();
  }
}

/**
 * @param params
 * @param logger
 */
async function unPublishTranslations (params, logger) {
  for (let i = 0; i < params.selection.length; i++) {
    const apiEndpoint = `https://${params.aemHost}${params.HOST_INSTANCE_ENTRY_POINT_UNPUBLISH}` +
        `&path=${encodeURIComponent(params.selection[i])}`;
    logger.info(`Request to ${apiEndpoint}`);

    const res = await fetch(apiEndpoint, {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + params.authConfig.imsToken,
      },
    });
    if (!res.ok) {
      logger.error(res);
      throw new Error(
        'request to ' + apiEndpoint + ' failed with status code ' + res.status
      );
    }
    await res.text();
  }
};

module.exports = {
  getTranslations,
  quickPublishTranslations,
  unPublishTranslations,
};
