/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/** This action emulate API call to storage where we store the model configuration
 * We store data in the following format:
 * {
 *     [butonId]: (true/false)
 * }
 * This config will be passed to the extension to configure the toolbar
 * For the purpose of this example we will return a hardcoded config
 * */

const fetch = require('node-fetch')
const {Core} = require('@adobe/aio-sdk')
const {errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs} = require('../utils')

const ALLOWED_BUTTONS = "aligncenter | alignjustify | alignleft | alignnone | alignright | blockquote | backcolor | bold | copy | cut | fontselect | fontsizeselect | forecolor | formatselect | h1 | h2 | h3 | h4 | h5 | h6 | indent | italic | language | lineheight | newdocument | outdent | paste | redo | remove | removeformat | selectall | strikethrough | styleselect | subscript | superscript | underline | undo | visualaid | pastetext | link | openlink | unlink | table | tablecellprops | tablecopyrow | tablecutrow | tabledelete | tabledeletecol | tabledeleterow | tableinsertdialog | tableinsertcolafter | tableinsertcolbefore | tableinsertrowafter | tableinsertrowbefore | tablemergecells | tablepasterowafter | tablepasterowbefore | tableprops | tablerowprops | tablesplitcells | tableclass | tablecellclass | tablecellvalign | tablecellborderwidth | tablecellborderstyle | tablecaption | tablecellbackgroundcolor | tablecellbordercolor | tablerowheader | tablecolheader | code | fullscreen | bullist | numlist | charmap | preview | searchreplace | visualblocks | insertdatetime | media | anchor";
/** update these constants to apply extension to your cf model */
const CF_MODEL_TITLE = "audi_test_model";
const BUTTON_TO_REMOVE = "bold";

const prepareConfig = () => {
    // Split the input string into an array of items
    const items = ALLOWED_BUTTONS.split(" | ");
    const jsonObject = {};
    // Create an object with each item as a key and true as the value
    items.forEach(item => {
        jsonObject[item] = true;
    });
    jsonObject[BUTTON_TO_REMOVE] = false;
    return {
        [CF_MODEL_TITLE]: {
            'toolbar': {
                'buttons': jsonObject
            }
        }
    };
}

// main function that will be executed by Adobe I/O Runtime
async function main(params) {
    // create a Logger
    const logger = Core.Logger('main', {level: params.LOG_LEVEL || 'info'})

    try {
        // 'info' is the default level if not set
        logger.info('Calling the main action')

        // log parameters, only if params.LOG_LEVEL === 'debug'
        logger.debug(stringParameters(params))

        /** @todo add here logic to fetch the model configuration from the storage */

        /** returns mock data */
        const content = prepareConfig();
        const response = {
            statusCode: 200,
            body: content
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
