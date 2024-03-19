/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { useEffect } from 'react';
import { generatePath } from 'react-router';
import { Text } from '@adobe/react-spectrum';
import { extensionId } from './Constants';
import { register } from '@adobe/uix-guest';

/**
 *
 */
export default function () {
  useEffect(() => {
    const init = async () => {
      const registrationConfig = {
        id: extensionId,
        methods: {
          headerMenu: {
            getButtons () {
              return [
                {
                  id: `${extensionId}.workflows`,
                  label: 'Workflows',
                  icon: 'PublishCheck',
                  variant: "action",
                  onClick: async () => {
                    const contentFragment = await guestConnection.host.contentFragment.getContentFragment();
                    const url = '/index.html#' + generatePath('/workflows/:fragmentIds', {
                      fragmentIds: encodeURIComponent([contentFragment.fragmentId]),
                    });

                    guestConnection.host.modal.showUrl({
                      title: 'Workflows',
                      url,
                      width: '900px',
                      height: '600px',
                    });
                  },
                },
              ];
            },
          },
        },
      };
      const guestConnection = await register(registrationConfig);
    };
    init().catch(console.error);
  }, []);
  return <Text>IFrame for integration with Host (AEM)... CF Editor</Text>;
};
