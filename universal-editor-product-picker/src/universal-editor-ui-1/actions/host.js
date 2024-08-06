/* 
* <license header>
*/

const fetch = require('node-fetch');

async function makeGraphqlRequest(params) {
  const apiEndpoint = `${params["commerce-endpoint"]}?`
    + new URLSearchParams({ 'query': params.query, variables: params.variables });
  const fetchSettings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...JSON.parse(params["commerce-http-headers"]),
    },
  };

  const result = await makeRequest(apiEndpoint, fetchSettings);
  return result;
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
  makeGraphqlRequest,
};
