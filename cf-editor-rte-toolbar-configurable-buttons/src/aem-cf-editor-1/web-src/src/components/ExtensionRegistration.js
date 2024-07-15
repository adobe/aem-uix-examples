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
              const auth = await guestConnection.sharedContext.get('auth')
              const token = auth.imsToken
              const imsOrg = auth.imsOrg
              const config = await getContentFragmentConfig(token, imsOrg);
              const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
              return processConfig(config, contentFragment.model.title);
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

export default ExtensionRegistration;
