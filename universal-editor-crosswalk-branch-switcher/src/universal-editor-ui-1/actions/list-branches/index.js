/*
Copyright 2022 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const { Core } = require('@adobe/aio-sdk');
const fetch = require('node-fetch');
const {
  errorResponse, checkMissingRequestInputs, getAemHost, getAemHeaders,
} = require('../utils');

async function getProperties(path, aemHost, headers, level = 0) {
    const response = await fetch(aemHost + path + `.${level}.json`, {
      method: 'GET',
      headers: headers,
    })
  
    if (!response.ok) {
      return false;
    }
  
    return await response.json();
  }


async function fetchRepoDetails(url, aemHost, headers) {
    const properties = await getProperties(url, aemHost, headers, 4);
    
    console.log(url);
    console.log(properties);
    const content = {
        repo: properties['settings']['cloudconfigs']['edge-delivery-service-configuration']['jcr:content']['repo'],
        owner: properties['settings']['cloudconfigs']['edge-delivery-service-configuration']['jcr:content']['owner'],
    }

    return content;
}

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
    const logger = Core.Logger("main", { level: params.LOG_LEVEL || "info" });
    // check for missing request input parameters and headers
    const requiredParams = ['url']
    const requiredHeaders = ['authorization', 'x-aem-host', 'x-gw-ims-org-id']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const aemHost = getAemHost(params);
    const headers = await getAemHeaders(params);
    const url = '/conf/' + params.url.split('/')[2];



    const repoDetail = await fetchRepoDetails(url, aemHost, headers);

    return { statusCode: 200, body: repoDetail};
}

exports.main = main;