/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React from 'react';
import { Text } from '@adobe/react-spectrum';
import { register } from '@adobe/uix-guest';
import { extensionId } from './Constants.js';
import { isValidApplicationUrl } from './Utils.js';

const DEFAULT_URL = 'https://experience.adobe.com/#/aem/generate-variations/';

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        headerMenu: {
          getButtons() {
            return [
              {
                id: 'generate-variations-header-menu-button',
                label: 'Generate Variations',
                icon: 'OpenIn',
                variant: 'secondary',
                async onClick() {
                  console.debug('Generate Variations button clicked...');

                  const context = guestConnection.sharedContext;

                  const { APPLICATION_URL: urlAsString = DEFAULT_URL } = guestConnection.configuration ?? {};

                  const url = new URL(urlAsString);

                  if (!isValidApplicationUrl(url)) {
                    console.error(`Invalid application URL: ${url.toString()}`);
                    return;
                  }

                  const aemHost = context.get('aemHost');
                  console.debug(`Resolved AEM Host: ${aemHost}`);

                  const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
                  const { fragmentId } = contentFragment;
                  console.debug(`Resolved Fragment ID: ${fragmentId}`);

                  url.searchParams.append('aemHost', aemHost);
                  url.searchParams.append('fragmentId', fragmentId);

                  console.debug(`Opening URL: ${url.toString()}...`);

                  window.open(url.toString(), '_blank');
                },
              },
            ];
          },
        },
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
