/*
 * <license header>
 */

const { Core } = require('@adobe/aio-sdk');
const {
  errorResponse,
  stringParameters,
  checkMissingRequestInputs,
  isSupportedAuthScheme,
} = require('../utils');
const { quickPublishTranslations } = require('../translations');

// main function that will be executed by Adobe I/O Runtime
/**
 * @param params
 */
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action');

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = ['authConfig', 'selection', 'aemHost'];
    const requiredHeaders = [];
    const errorMessage = checkMissingRequestInputs(
      params,
      requiredParams,
      requiredHeaders
    );
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }

    if (isSupportedAuthScheme(params) === false) {
      return errorResponse(
        400,
        'Unsupported authentication method: ' + params.authConfig.authScheme,
        logger
      );
    }

    await quickPublishTranslations(params, logger);

    const response = {
      statusCode: 200,
      body: params.selection,
    };

    // log the response status code
    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
