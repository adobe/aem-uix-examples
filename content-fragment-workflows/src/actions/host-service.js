/* 
* <license header>
*/

const fetch = require('node-fetch');

async function getWorkflows(aemHost, token) {
  const apiEndpoint = `https://${aemHost}/libs/cq/gui/content/common/listworkflows.html`;
  const fetchSettings = {
    method: "GET",
    headers: {
      "Content-Type": "text/html",
      "Authorization": 'Bearer ' + token,
    },
  };

  const workflows = await makeRequest(apiEndpoint, fetchSettings);
  return workflows;
}

async function getContentFragmentsWithReferences(aemHost, token, fragmentIds) {
  const contentFragments = await getContentFragmentsWithChildrenReferences(aemHost, token, fragmentIds);
  const parentReferences = await getParentReferences(aemHost, token, contentFragments);

  const contentFragmentsWithReferencedBy = contentFragments.map(fragment => ({
    ...fragment,
    referencedBy: (parentReferences.items.find(parentRef => parentRef.path === fragment.path) || {}).parentReferences || [],
  }));
  return contentFragmentsWithReferencedBy;
}

async function getContentFragmentsWithChildrenReferences(aemHost, token, fragmentIds) {
  const fetchSettings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Adobe-Accept-Unsupported-API": 1,
      "If-None-Match": "string",
      "Authorization": `Bearer ${token}`,
    },
  };

  const contentFragments = [];
  for (const fragmentId of fragmentIds) {
    const apiEndpoint = `https://${aemHost}/adobe/sites/cf/fragments/${fragmentId}?references=all`;
    const contentFragment = await makeRequest(apiEndpoint, fetchSettings);
    contentFragments.push({
      path: contentFragment.path,
      id: contentFragment.id,
      title: contentFragment.title,
      references: contentFragment.references,
      status: contentFragment.status,
    });
  }
  return contentFragments;
}

async function getParentReferences(aemHost, token, contentFragments) {
  const fragmentPaths = contentFragments.map(item => item["path"]);
  const fetchSettings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Adobe-Accept-Unsupported-API": 1,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      paths: fragmentPaths,
    }),
  };

  const apiEndpoint = `https://${aemHost}/adobe/sites/cf/fragments/referencedBy`;
  const parentReferences = await makeRequest(apiEndpoint, fetchSettings);
  return parentReferences;
}

async function startWorkflow(aemHost, token, contentFragmentPath, model, workflowTitle) {
  const apiEndpoint = `https://${aemHost}/var/workflow/instances`;
  const formData = new URLSearchParams();
  formData.append("_charset_", "utf-8");
  formData.append(":status", "browser");
  formData.append("payloadType", "JCR_PATH");
  formData.append("payload", contentFragmentPath);
  formData.append("model", model);
  formData.append("workflowTitle", workflowTitle);

  const fetchSettings = {
    method: "POST",
    headers: {
      "Authorization": 'Bearer ' + token,
    },
    body: formData,
  };

  const content = await makeRequest(apiEndpoint, fetchSettings);
  return content;
}

async function makeRequest(apiEndpoint, fetchSettings) {
  const res = await fetch(apiEndpoint, fetchSettings);

  if (!res.ok) {
    throw new Error(`request to ${apiEndpoint} failed with status code ${res.status} and when sent 
      fetchSettings: ${JSON.stringify(fetchSettings, null, 2)}`);
  }

  const content = fetchSettings?.headers?.["Content-Type"] === "application/json"
      ? await res.json()
      : await res.text();

  return content;
}

module.exports = {
  getWorkflows,
  getContentFragmentsWithReferences,
  startWorkflow,
};
