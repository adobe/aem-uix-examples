/* 
* <license header>
*/

const fetch = require('node-fetch');

async function getConfig(configFile) {
  const fetchSettings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const result = await makeRequest(configFile, fetchSettings);
  return result;
}

async function makeGraphqlRequest(graphqlApi, params) {
  const apiEndpoint = `${graphqlApi}?` + new URLSearchParams({ 'query': params.query, variables: params.variables });
  const fetchSettings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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
  getConfig,
  makeGraphqlRequest,
};
