/*
* <license header>
*/

/**
 * This is a sample action showcasing how to create new Content Fragments using AEM Assets API.
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
    logger.info('Calling the main action of create-new-fragments')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = ["aemHost", "authConfig", "fragments"];
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    // create new content fragments in CF Admin Console
    try {
      await createNewFragments(params.aemHost, params.authConfig.imsToken, params.fragments, logger)
    } catch (error) {
      return errorResponse(500, error.message, logger)
    }

    const response = {
      statusCode: 200,
      body: {
        message: `${params.fragments.length} Content Fragments imported successfully.`
      }
    }

    // log the response status code
    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

async function createNewFragments(aemHost, imsToken, fragments, logger) {
  for (let i = 0; i < fragments.length; i++) {
    const cfParentPath = fragments[i].folderId.replace('/content/dam/', '')
    const cfName = fragments[i].name
    const apiEndpoint = `https://${aemHost}/api/assets/${cfParentPath}/${cfName}`
    logger.info(`Request to ${apiEndpoint}`)

    const payload = {
      "properties": {
        "cq:model": fragments[i].modelId,
        "title": fragments[i].title
      }
    }

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Authorization': `Bearer ${imsToken}`,
        'Content-Type': 'application/json'
      },
    })

    if (!res.ok) {
      logger.error(res)
      throw new Error("Failed to import Content Fragment(s).")
    }
  }
}

exports.main = main
