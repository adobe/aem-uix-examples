/*
* <license header>
*/

const { errorResponse, getBearerToken, checkMissingRequestInputs } = require('../utils');

/**
 * Generic Web Action — Sample Extension
 *
 * Called from TabPanel.js with the current asset ID.
 * Customize this to call AEM Assets Author API.
 *
 * Params passed from the panel:
 *   assetId  — asset urn from host.assetDetails.getCurrentAsset()
 *   aemHost  — AEM author URL from host.discovery.getAemHost()
 *   apiKey   — from host.auth.getApiKey() (never hardcode)
 *   imsOrg   — from host.auth.getIMSInfo()
 *
 * To call authenticated AEM APIs:
 *   1. Set require-adobe-auth: true in ext.config.yaml
 *   2. Send Authorization header from the panel
 *   3. Uncomment the fetch block below
 */
async function main(params) {
  console.log('sample-extension action called', JSON.stringify({ assetId: params.assetId }, null, 2));

  try {
    // Uncomment for authenticated AEM API calls:
    // const token = getBearerToken(params);
    // const { assetId, aemHost, apiKey, imsOrg } = params;
    //
    // const response = await fetch(`https://${aemHost}/adobe/assets/${assetId}/metadata`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'X-Api-Key': apiKey,           // always from frontend — never hardcode
    //     'x-gw-ims-org-id': imsOrg,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();
    // const metadata = data.value ?? data;
    // return { statusCode: 200, body: { metadata } };

    return {
      statusCode: 200,
      body: {
        message: 'Action executed successfully',
        timestamp: new Date().toISOString(),
        assetId: params.assetId || null,
      },
    };

  } catch (error) {
    console.error('Action error:', error);
    return errorResponse(500, `Action failed: ${error.message}`);
  }
}

exports.main = main;
