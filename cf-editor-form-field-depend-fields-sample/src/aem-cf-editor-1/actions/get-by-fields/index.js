/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
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


const fetch = require("node-fetch");
const { Core } = require("@adobe/aio-sdk");
const { errorResponse, getAemHeaders, stringParameters, checkMissingRequestInputs } = require("../utils");

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
  // create a Logger
  const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.info(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = [/* add required params */];
    const requiredHeaders = [];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }

    const response = await fetch("http://api.geonames.org/countryInfoJSON?username=rainerbartl2803");
    const data = await response.json();
    const searchParams = params.searchParams;
    const searchParamsKeys = Object.keys(searchParams);
    const keyMap = {
      continents: "continentName",
      countries: "countryName"
    };
    const result = {};
    let dataTranslations = [];

    for (const key of searchParamsKeys) {
      const criteria = searchParams[key];
      const keyIndex = {};
      result[key] = [];
      let d;
      d = data.geonames;

      if (criteria) {
        if (criteria.field === "countries" && criteria.value) {
          const rt = await fetch(`https://restcountries.com/v3.1/name/${criteria.value}?fullText=true`);
          dataTranslations = await rt.json();
          if (dataTranslations[0].translations) {
            const translations = dataTranslations[0].translations;
            const translationsKeys = Object.keys(translations);
            result[key] = translationsKeys.map((key) => ({
              name: translations[key].official,
              value: translations[key].official
            }));
          }
        } else {
          let filterredData = d.filter((item) => item[keyMap[criteria.field] || criteria.field] === criteria.value);
          filterredData.forEach((item) => {
            if (!keyIndex[item[keyMap[key] || key]]) {
              keyIndex[item[keyMap[key] || key]] = true;
              result[key].push({
                name: item[keyMap[key] || key],
                value: item[keyMap[key] || key]
              })
            }
          });
        }
      } else {
        d.forEach((item) => {
          if (!keyIndex[item[keyMap[key] || key]]) {
            keyIndex[item[keyMap[key] || key]] = true;
            result[key].push({
              name: item[keyMap[key] || key],
              value: item[keyMap[key] || key]
            })
          }
        });
      }
    }

    return {
      statusCode: 200,
      body: result
    };
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, error.toString(), logger);
  }
}

exports.main = main;
