const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs, isSupportedAuthScheme } = require('../utils')
const { getContentFragmentsInfo } = require('../aemcs')

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger('get-cf-info', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the get-cf-info action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))
    const requiredParams = ['aemHost', 'fragmentIds', 'authConfig']
    const requiredHeaders = []

    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    if (isSupportedAuthScheme(params) === false) {
      return errorResponse(
        400,
        'Unsupported authentication method: ' + params.authConfig.authScheme,
        logger
      );
    }

    const fragmentsInfo = await getContentFragmentsInfo(params, logger);

    const response = {
      statusCode: 200,
      body: fragmentsInfo
    };

    // log the response status code
    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, error.message, logger)
  }
}

exports.main = main
