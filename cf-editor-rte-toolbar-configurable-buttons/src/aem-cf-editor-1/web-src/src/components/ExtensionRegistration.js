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

import {Text} from "@adobe/react-spectrum";
import {register} from "@adobe/uix-guest";
import {extensionId} from "./Constants";
import {getContentFragmentConfig} from "../utils";
import metadata from '../../../../app-metadata.json';

const getKeysWithValueFalse = (jsonObject)=> {
  const keysWithFalseValue = [];
  for (const [key, value] of Object.entries(jsonObject)) {
    if (value === false) {
      keysWithFalseValue.push({id:key});
    }
  }
  return keysWithFalseValue;
}

const processConfig = (config, cf) => {
  let buttonsToRemove = [];
  if (config?.[cf]) {
    buttonsToRemove = getKeysWithValueFalse(config[cf].toolbar.buttons);
  }
  return buttonsToRemove;
}

function ExtensionRegistration() {

  /** this example demonstrates
   * how to register an extension with the host and read buttons config from the 3rd party call
   *
   * you also can put more comprehensive logic here to handle the buttons config
   * see https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/rte-toolbar/#standard-buttons
   * */
  const init = async () => {
    const registrationConfig = {
      id: extensionId,
      metadata,
      methods: {
        rte: {
          removeButtons: async () => {
            try {
              const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
              console.log('contentFragment', contentFragment);
              const customerSetUp = await guestConnection.configuration;
              console.log('customerSetUp', customerSetUp);
              if (!customerSetUp ) {
                console.error('No configuration found. Please specify ');
                return [];
              }
              const config = getContentFragmentConfig(customerSetUp, contentFragment.model.path);
              return processConfig(config, contentFragment.model.path);
            } catch (e) {
              console.error('Error while removing buttons', e);
              return [];
            }
          }
        }
      }
    };
    const guestConnection = await register(registrationConfig);
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

function getContentFragmentConfig(config, modelPath) {
  // const path = config['model_path'];

  if (modelPath === config?.['model_path']) {
    const configItems = config['remove_buttons'].split(",");
    // Split the input string into an array of items
    const items = ALLOWED_BUTTONS.split(" | ");

    const jsonObject = {};
    // Create an object with each item as a key and true as the value
    items.forEach(item => {
      if (configItems.includes(item)) {
        jsonObject[item] = false;
      }
    });
    return {
      [modelPath]: {
        'toolbar': {
          'buttons': jsonObject
        }
      }
    }
  }
}


export default ExtensionRegistration;
