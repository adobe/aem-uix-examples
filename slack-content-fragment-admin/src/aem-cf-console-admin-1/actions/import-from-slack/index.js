/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * This is a sample action showcasing how to retrieve the latest Slack message from a channel.
 */


const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action of import-from-slack')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = ['SLACK_OAUTH_TOKEN', 'channelId']
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('channel', params.channelId)
    searchParams.append('limit', 1)

    // replace this with the api you want to access
    const apiEndpoint = `https://slack.com/api/conversations.history?${searchParams.toString()}`
    logger.debug(apiEndpoint)

    // fetch content from external api endpoint
    const res = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.SLACK_OAUTH_TOKEN}`
      }
    })
    if (!res.ok) {
      return errorResponse(res.status, 'Something is wrong with your Slack OAuth token.', logger)
    }

    try {
      const content = await res.json()
      const slackText = JSON.parse(content['messages'][0]['text'])
      var fragmentsJSON = slackText['selectedContentFragments']
    } catch (error) {
      return errorResponse(res.status, 'Failed to parse Content Fragment(s) from the recent Slack message.', logger)
    }

    const response = {
      statusCode: 200,
      body: {
        message: `Content Fragments parsed successfully.`,
        fragments: fragmentsJSON
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

exports.main = main
