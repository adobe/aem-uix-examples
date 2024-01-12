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
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs, getAemHeaders } = require('../utils');
const ACTION_ACTIVATE = "Activate";

function getReferencedModels(paths, assets) {
    const referencedModels = [];
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        // if server returns a list containing at least one asset which is not yet published
        // and is not one of the selected nodes to publish
        if ((!asset.published || asset.outdated) && paths.indexOf(asset.path) === -1 && (asset.type === "contentfragmentmodel" || asset.type === "asset")) {
            referencedModels.push(asset.path);
        }
    }
    return referencedModels;
}

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
    // create a Logger
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

    try {
        // 'info' is the default level if not set
        logger.info('Calling the publish action')

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
        const assetsFormData = new FormData();
        params.paths.map(el => assetsFormData.append("path", el));

        const assetsResponse = await fetch(params.aemHost + "/libs/wcm/core/content/reference.json", {
            headers: headers,
            method: "POST",
            body: assetsFormData
        });
        logger.info(` Assets response status text ${assetsResponse.statusText}`);

        if (!assetsResponse.ok) {
            throw new Error('request to get Assets' + params.aemHost + ' failed with status code ' + assetsResponse.status)
        }
        logger.info(`${assetsResponse.status}: successful assets request`);
        /** @todo update logic to publish related assets as well*/
        /** currently response is empty */
        // const assets = assetsResponse.json()['assets'];
        // const referencedModels = getReferencedModels(params.paths, assets);
        const publishFormData = new FormData();
        params.paths.map(el => publishFormData.append("path", el));
        // publishFormData.append("paths", params.paths.concat(referencedModels));

        // publishFormData.append("path", params.paths[0]);
        publishFormData.append("_charset_", "utf-8");
        publishFormData.append("cmd", ACTION_ACTIVATE);
        //publish
        const publishResponse = await fetch(params.aemHost + "/bin/replicate.json", {
            headers: headers,
            method: "POST",
            body: publishFormData
        });
        logger.info(`Publish response status text ${publishResponse.statusText}`);
        if (!publishResponse.ok) {
            throw new Error('request to get Publish ' + params.aemHost + ' failed with status code ' + publishResponse.status)
        }
        logger.info(`${publishResponse?.status}: successful publish request`);
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



// replication url

/*Original logic:*/
// https://git.corp.adobe.com/CQ/dam-contentfragment/pull/1888/files#diff-6a1ef81fc0da02ed63bfa68d8a57e2ed94dc12b2659d03725d876638892c8b37

// {
//     text: Granite.I18n.get('Publish and Export'),
//         id: 'publish-and-export',
//     primary: true,
//     handler: async function () {
//     await publishPaths(unpublishedPaths);
//     processCFToTarget(cfPaths, ACTION_EXPORT);
// }
// }

// async function publishPaths(paths) {
//     // get references
//     return new Promise(function(resolve, reject) {
//         $.ajax(REFERENCES_URL, {
//             'data': {
//                 'path': paths
//             },
//             'method': 'POST',
//             'cache': false,
//             'dataType': 'json',
//             'beforeSend': function() {
//                 ui.wait();
//             },
//             'complete': function (xhr, status) {
//                 ui.clearWait();
//                 if (status === 'success') {
//                     const json  = $.parseJSON(xhr.responseText);
//                     const assets = json['assets'];
//                     const referencedCFModels = getReferencedCFModels(paths, assets);
//                     publish(paths.concat(referencedCFModels)).then(function() {
//                         resolve();
//                     });
//                 } else {
//                     reject();
//                 }
//             }
//         });
//     });
//     // publish
// }

// function publish(paths) {
//     return $.ajax(REPLICATION_URL, {
//         'type': 'POST',
//         'data': {
//             '_charset_': 'utf-8',
//             'cmd': ACTION_ACTIVATE,
//             'path': paths
//         }
//     });
// }

// step1
// fetch("https://author-p72004-e903678.adobeaemcloud.com/libs/wcm/core/content/reference.json", {
//     "headers": {
//         "accept": "application/json, text/javascript, */*; q=0.01",
//         "accept-language": "en-US,en;q=0.9",
//         "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "csrf-token": "eyJleHAiOjE3MDQ5MjQ5NTgsImlhdCI6MTcwNDkyNDM1OH0.jkML0q7o7SigsP7qzEV3P3pXP50CcvwfWgDBL-LMKag",
//         "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"macOS\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "x-requested-with": "XMLHttpRequest"
//     },
//     "referrer": "https://author-p72004-e903678.adobeaemcloud.com/assets.html/content/dam/sample-wknd-app/en/content-fragments/image-layers",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "path=%2Fcontent%2Fdam%2Fsample-wknd-app%2Fen%2Fcontent-fragments%2Fimage-layers%2F10-01-image-layers-test-target-publish-and-export",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// });

// step 2
// fetch("https://author-p72004-e903678.adobeaemcloud.com/bin/replicate.json", {
//     "headers": {
//         "accept": "*/*",
//         "accept-language": "en-US,en;q=0.9",
//         "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "csrf-token": "eyJleHAiOjE3MDQ5MjQ5NTgsImlhdCI6MTcwNDkyNDM1OH0.jkML0q7o7SigsP7qzEV3P3pXP50CcvwfWgDBL-LMKag",
//         "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"macOS\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "x-requested-with": "XMLHttpRequest"
//     },
//     "referrer": "https://author-p72004-e903678.adobeaemcloud.com/assets.html/content/dam/sample-wknd-app/en/content-fragments/image-layers",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "_charset_=utf-8&cmd=Activate&path=%2Fcontent%2Fdam%2Fsample-wknd-app%2Fen%2Fcontent-fragments%2Fimage-layers%2F10-01-image-layers-test-target-publish-and-export",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// });

// step 3

// fetch("https://author-p72004-e903678.adobeaemcloud.com/content/dam/sample-wknd-app/en/content-fragments/image-layers/10-01-image-layers-test-target-publish-and-export.cfm.targetexport", {
//     "headers": {
//         "accept": "*/*",
//         "accept-language": "en-US,en;q=0.9",
//         "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "csrf-token": "eyJleHAiOjE3MDQ5MjQ5NTgsImlhdCI6MTcwNDkyNDM1OH0.jkML0q7o7SigsP7qzEV3P3pXP50CcvwfWgDBL-LMKag",
//         "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"macOS\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "x-requested-with": "XMLHttpRequest"
//     },
//     "referrer": "https://author-p72004-e903678.adobeaemcloud.com/assets.html/content/dam/sample-wknd-app/en/content-fragments/image-layers",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "paths=%2Fcontent%2Fdam%2Fsample-wknd-app%2Fen%2Fcontent-fragments%2Fimage-layers%2F10-01-image-layers-test-target-publish-and-export&action=export&_charset_=utf-8",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// });