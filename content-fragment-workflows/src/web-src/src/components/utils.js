/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import actions from "../config.json";

const convertHTMLToJSON = (html) => {
  const doc = (new DOMParser()).parseFromString(html, "text/html");
  const select = doc.querySelector("coral-select");
  const options = Array.from(select.querySelectorAll("coral-select-item"));
  return options.map((option) => ({
    value: option.getAttribute("value"),
    label: option.textContent,
  }));
};

export const getWorkflows = async ({ aemHost, token }) => {
  const response = await actionWebInvoke(
      actions['get-workflows'],
      {
        "aemhost": aemHost,
        "authorization": token,
      },
      {},
      { method: "GET"}
  );
  return convertHTMLToJSON(response);
};

export const getContentFragments = async ({ aemHost, token, fragmentIds }) => {
  const response = await actionWebInvoke(
      actions['get-content-fragments'],
      {
        "aemhost": aemHost,
        "authorization": token,
      },
      {
        "fragmentIds": fragmentIds,
      },
      { method: "GET" }
  );
  return response;
};

export const startWorkflow = async ({ aemHost, token, workflowModel, workflowTitle, contentFragmentPath }) => {
  const response = await actionWebInvoke(
      actions['start-workflow'],
      {
        "aemhost": aemHost,
        "authorization": token,
      },
      {
        "contentFragmentPath": contentFragmentPath,
        "model": workflowModel,
        "workflowTitle": workflowTitle,
      },
      { method: "POST" }
  );
  return response;
};

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
