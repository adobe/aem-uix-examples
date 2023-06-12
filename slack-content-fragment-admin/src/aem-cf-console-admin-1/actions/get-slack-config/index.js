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
 * This is a sample action showcasing how to retrieve your Slack configuration from .env file as input parameters.
 */


const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  // log parameters, only if params.LOG_LEVEL === 'debug'
  logger.debug(stringParameters(params))

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action of get-slack-config')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    return {
      statusCode: 200,
      body: {
        message: "Request Successful!",
        slackWebhook: params.SLACK_WEBHOOK,
        slackChannel: params.SLACK_CHANNEL,
        slackOAuthToken: params.SLACK_OAUTH_TOKEN
      }
    }
  
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main