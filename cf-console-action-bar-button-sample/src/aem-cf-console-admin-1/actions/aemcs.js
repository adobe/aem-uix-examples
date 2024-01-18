const { context, getToken } = require('@adobe/aio-lib-ims');
const { createFetch } = require('@adobe/aio-lib-core-networking');
const fs = require('fs');

const IMS_CONFIG_FILENAME = 'aem-integration-data.json';

async function getContentFragment(aemBucket, fragmentId) {
  const endpoint = `https://${aemBucket}.adobeaemcloud.com/adobe/sites/cf/fragments/${fragmentId}?references=direct`;
  const token = await getAccessToken();
  const fetch = createFetch();
  const result = await fetch(
    endpoint,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Adobe-Accept-Unsupported-API': 1,
      },
    }
  );
  if (!result.ok) {
    throw new Error(`Request to ${endpoint} failed with a status code ${result.status}: ${await result.text()}`);
  }
  const response = await result.json();

  return response;
}

async function getContentFragmentPublicationStatus(aemBucket, fragmentId) {
  const endpoint = `https://${aemBucket}.adobeaemcloud.com/adobe/sites/cf/fragments/${fragmentId}/scheduledPublicationStatus`;
  const token = await getAccessToken();
  const fetch = createFetch();
  const result = await fetch(
    endpoint,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Adobe-Accept-Unsupported-API': 1,
      },
    }
  );
  if (!result.ok) {
    throw new Error(`Request to ${endpoint} failed with a status code ${result.status}: ${await result.text()}`);
  }
  const response = await result.json();

  return response;
}

async function getVersionsForContentFragment(aemBucket, fragmentId, limit = 50) {
  const endpoint = `https://${aemBucket}.adobeaemcloud.com/adobe/sites/cf/fragments/${fragmentId}/versions?limit=${limit}`;
  const token = await getAccessToken();
  const fetch = createFetch();

  const fetchData = async (apiUrl) => {
    const data = [];
    const result = await fetch(
      apiUrl,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Adobe-Accept-Unsupported-API': 1,
        },
      }
    );
    if (!result.ok) {
      throw new Error(`Request to ${apiUrl} failed with a status code ${result.status}: ${await result.text()}`);
    }

    const response = await result.json();
    data.push(...response.items);

    if (response.cursor) {
      const next = await fetchData(`${endpoint}&cursor=${response.cursor}`);
      data.push(...next);
    }

    return data;
  }

  return await fetchData(endpoint);
}

/**
 * @returns {Promise} Resolving to an access token (string)
 * @private
 */
async function getAccessToken() {
  const imsContextConfig = getImsConfig();
  context.set('aemcs_jwt', imsContextConfig);
  return await getToken('aemcs_jwt');
}

/**
 * @returns {object}
 * @private
 */
function getImsConfig() {
  return JSON.parse(fs.readFileSync(__dirname + '/' + IMS_CONFIG_FILENAME, 'utf8'));
}

module.exports = {
  getContentFragment,
  getContentFragmentPublicationStatus,
  getVersionsForContentFragment
}
