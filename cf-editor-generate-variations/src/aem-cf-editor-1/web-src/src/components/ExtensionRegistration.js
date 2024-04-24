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

const DEFAULT_URL = 'https://experience.adobe.com/#/aem/generate-variations/';

function isValidApplicationUrl(url) {
  return /experience(-\w+)?\.adobe\.com/.test(url.host) && (url.hash === '#/aem/generate-variations/');
}

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
                async onClick() {
                  console.debug('Generate Variations button clicked...');

                  const context = guestConnection.sharedContext;
                  console.debug(`context: ${JSON.stringify(context)}`);

                  console.debug('Default URL: ', DEFAULT_URL);

                  const { APPLICATION_URL } = guestConnection.configuration;
                  console.debug(`APPLICATION_URL: ${APPLICATION_URL}`);

                  const resolvedUrl = APPLICATION_URL ?? DEFAULT_URL;
                  console.debug(`Application URL: ${resolvedUrl}`);

                  const applicationUrl = new URL(resolvedUrl);

                  if (!isValidApplicationUrl(applicationUrl)) {
                    console.error('Invalid Application URL');
                    return;
                  }

                  const aemHost = context.get('aemHost');
                  console.debug(`aemHost: ${aemHost}`);

                  const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
                  console.debug(`contentFragment: ${JSON.stringify(contentFragment)}`);

                  const { fragmentId } = contentFragment;
                  console.debug(`fragmentId: ${fragmentId}`);

                  applicationUrl.searchParams.append('aemHost', aemHost);
                  applicationUrl.searchParams.append('fragmentId', fragmentId);

                  console.debug(`Opening application URL: ${applicationUrl.toString()}...`);

                  window.open(applicationUrl.toString(), '_blank');
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
