const { createFetch } = require('@adobe/aio-lib-core-networking');

async function getContentFragmentsInfo(params) {
  let fragmentsInfo = [];
  try {
    for (const id of params.fragmentIds) {
      try {
        const cf = await getContentFragment(params.aemHost, id, params.authConfig.imsToken);
        const versions = await getVersionsForContentFragment(params.aemHost, id, params.authConfig.imsToken);
        fragmentsInfo.push({versions, ...cf});
      } catch(e) {
        throw e; 
      }
    }
    return fragmentsInfo;
  } catch(e) {
    throw e;
  }
}

async function getContentFragment(aemHost, fragmentId, token) {
  const endpoint = `https://${aemHost}/adobe/sites/cf/fragments/${fragmentId}?references=direct`;
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

async function getContentFragmentPublicationStatus(aemHost, fragmentId, token) {
  const endpoint = `https://${aemHost}/adobe/sites/cf/fragments/${fragmentId}/scheduledPublicationStatus`;
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

async function getVersionsForContentFragment(aemHost, fragmentId, token, limit = 50) {
  const endpoint = `https://${aemHost}/adobe/sites/cf/fragments/${fragmentId}/versions?limit=${limit}`;
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

module.exports = {
  getContentFragmentsInfo,
  getContentFragment,
  getContentFragmentPublicationStatus,
  getVersionsForContentFragment,
}
