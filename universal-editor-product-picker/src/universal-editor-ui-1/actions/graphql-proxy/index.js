/*
 * <license header>
 */

const { Core } = require("@adobe/aio-sdk");
const { errorResponse, checkMissingRequestInputs, stringParameters } = require("../utils");
const { makeGraphqlRequest } = require("../host");

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
  //
  try {
    // "info" is the default level if not set
    logger.info("Calling the main action");

    // log parameters, only if params.LOG_LEVEL === "debug"
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = ['commerce-endpoint', 'query'];
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

    const result = await makeGraphqlRequest(params);

    const response = {
      statusCode: 200,
      body: result,
    };

    // log the response status code
    logger.info(`${response.statusCode}: successful request`);
    return response;
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, "server error " + error.message, logger);
  }
}

exports.main = main;
