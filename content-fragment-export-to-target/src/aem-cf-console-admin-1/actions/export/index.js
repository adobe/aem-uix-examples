/*
* <license header>
*/

const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs, getAemHeaders } = require('../utils')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = [/* add required params */]
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const headers = await getAemHeaders(params);
    const formData = new FormData();
    params.paths.map(el => formData.append("paths", el));
    formData.append("action", "export");
    formData.append("_charset_", "UTF-8");

    const exportResponse = await fetch(params.aemHost + params.paths[0] + ".cfm.targetexport", {
      headers: headers,
      method: "POST",
      body: formData
    });

    logger.info(` Export response status text ${exportResponse.statusText}`)
    if (!exportResponse.ok) {
      throw new Error('request to ' + params.aemHost + ' failed with status code ' + exportResponse.status)
    }

    logger.info(`${exportResponse.status}: successful export request`)
    return {
      statusCode: 200,
      body: "{}"
    };

  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, `Server error: ${error}`, logger)
  }
}

exports.main = main
