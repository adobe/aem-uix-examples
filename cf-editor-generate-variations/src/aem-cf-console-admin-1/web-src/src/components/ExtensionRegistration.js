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
                  console.log('Generate Variations button clicked...');

                  const context = guestConnection.sharedContext;
                  console.log(`context: ${JSON.stringify(context)}`);

                  const { env } = guestConnection.configuration ?? { env: 'qa' };
                  console.log(`env: ${env}`);

                  const aemHost = context.get('aemHost');
                  console.log(`aemHost: ${aemHost}`);

                  const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
                  console.log(`contentFragment: ${JSON.stringify(contentFragment)}`);

                  const { fragmentId } = contentFragment;
                  console.log(`fragmentId: ${fragmentId}`);

                  if (env === 'qa') {
                    window.open(`https://experience-qa.adobe.com/?shell_source=local&devMode=true&shell_ims=prod&aemHost=${aemHost}&fragmentId=${fragmentId}#/@sitesinternal/aem/generate-variations/`, '_blank');
                  } else {
                    window.open(`https://experience-stage.adobe.com/?shell_ims=prod&aemHost=${aemHost}&fragmentId=${fragmentId}#/@sitesinternal/aem/generate-variations/`, '_blank');
                  }
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
