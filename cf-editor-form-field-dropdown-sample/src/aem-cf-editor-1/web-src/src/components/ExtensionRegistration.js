/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { generatePath } from "react-router";


function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        field: {
          getDefinitions: () => ([
            {
              fieldNameExp: '^author',
              url: "/#/dropdown-route",
              overlay: true
            },
            {
              fieldNameExp: 'dateX',
              url: "/#/dropdown-route",
              overlay: true
            },
            {
              fieldNameExp: 'number',
              url: "/#/dropdown-route",
              overlay: true
            },
            {
              fieldNameExp: 'numberMulti',
              url: "/#/dropdown-route",
              overlay: true
            },
            {
              fieldNameExp: '^boolean',
              url: "/#/dropdown-route",
              overlay: true
            },
            {
              fieldNameExp: '^dateTime',
              url: "/#/dropdown-route",
              overlay: true
            },
          ]),
          getProperties: async () => {
            return [
              {
                fieldNameExp: '^dateX',
                disabled: true
              },
            ];
          },
        },
      }
    });

  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
