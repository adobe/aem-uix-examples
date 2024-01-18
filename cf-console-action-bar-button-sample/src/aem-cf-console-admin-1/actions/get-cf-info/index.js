const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs, getBearerToken } = require('../utils')
const { getVersionsForContentFragment, getContentFragment } = require('../aemcs')

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('get-latest-version', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the get-latest-version action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))
    const requiredParams = ['aemHost', 'fragmentIds']
    const requiredHeaders = ['Authorization']

    const bearerToken = getBearerToken(params)

    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }
    const aemHost = params.aemHost
    const aemBucket = aemHost.split('.')[0]

    const fragmentIds = params.fragmentIds.split(',');
    let fragments = [];
    for (const id of fragmentIds) {
      try {
        const cf = await getContentFragment(aemBucket, id);
        const versions = await getVersionsForContentFragment(aemBucket, id);
        fragments.push({versions, ...cf});
      } catch(e) {
        throw e; 
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: fragments
    }
    

    
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, error.message, logger)
  }
}
/*
function findLatestVersionId(items) {
  let latestVersionId = null;
  let latestTimestamp = 0;

  items.forEach(item => {
    const timestamp = new Date(item.created).getTime();
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestVersionId = item.id;
    }
  });
  return latestVersionId;
}
*/
exports.main = main
