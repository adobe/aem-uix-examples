/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
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
    logger.info('Calling the save-draft runtime action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = ['connections', 'target', 'value']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    // extract the user Bearer token from the Authorization header
    const token = getBearerToken(params)

    // Update content
    let url = `${params.UNIVERSAL_EDITOR_URL}/update`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            connections: params.connections,
            target: params.target,
            value: params.value
        })
    })

    if (!res.ok) {
      throw new Error(`request to ${url} failed with status code: ${res.status} - ${res.statusText}`)
    }

    const response = {
      statusCode: 200,
      body: {
          success: true,
          result: await res.json()
      }
    }

    // log the response status code
    logger.info(`${response.statusCode}: Save of draft done successfully`)
    return response
  } catch (error) {
    logger.error(error)
    // return with 500
    return errorResponse(500, `Failed to update the content with error: ${error.message}`, logger)
  }
}

exports.main = main
