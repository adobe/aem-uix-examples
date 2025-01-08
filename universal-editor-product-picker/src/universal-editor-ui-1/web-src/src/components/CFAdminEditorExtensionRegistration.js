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
import { Text } from '@adobe/react-spectrum';
import { extensionId } from './constants';
import { register } from '@adobe/uix-guest';
import metadata from '../../app-metadata.json';

export default function () {
  useEffect(() => {
    const init = async () => {
      const guestConnection = await register({
        id: extensionId,
        metadata,
        methods: {
          field: {
            getDefinitions: () => {
              const dataType = guestConnection.configuration?.["component-type"] || "product_picker";
              return [
                {
                  fieldNameExp: '^sku$',
                  dataType: dataType,
                  url: '/index.html#/product-field',
                },
              ];
            },
          },
        },
      });
    };
    init().catch(console.error);
  }, []);
  return <Text>IFrame for integration with Host (AEM)... CF Admin Console</Text>;
};
