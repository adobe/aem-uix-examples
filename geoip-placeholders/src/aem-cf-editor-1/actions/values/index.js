/*
* <license header>
*/

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */


const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils')

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
    const requiredParams = ['placeholder']
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const placeholder = params['placeholder'].split('.', '3');
    if (placeholder[0] !== 'location') {
      throw new Error(`Requested placeholder from unsupported service "${placeholder[0]}"`);
    }

    const ip = params.__ow_headers['x-forwarded-for'].split(',')[0];
    const ipLookup = await fetch(`http://ipwho.is/${ip}`);
    if (!ipLookup.ok) {
      throw new Error('IP lookup failed with status code ' + ipLookup.status);
    }
    const ipInfo = await ipLookup.json();

    if (typeof ipInfo[placeholder[1]] === 'undefined') {
      throw new Error(`Requested placeholder "${placeholder[1]}" unsupported by location service`);
    }

    let value = ipInfo[placeholder[1]];
    if (placeholder.length > 2) {
      if (typeof value[placeholder[2]] === 'undefined') {
        throw new Error(`Requested placeholder "${placeholder[1]}.${placeholder[2]}" unsupported by location service`);
      }
      value = value[placeholder[2]];
    }

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        data: value
      }
    }

    // log the response status code
    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, `server error: ${error}`, logger)
  }
}

exports.main = main
