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
import metadata from '../../../../app-metadata.json';

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      metadata,
      methods: {
        headerMenu: {
          getButtons() {
            return [
              // YOUR HEADER BUTTONS CODE SHOULD BE HERE
              {
                id: "aem-uix-examples-cf-console-header-menu-button",
                label: "Sample Button",
                icon: "Plug",
                variant: "secondary",
                subItems: [
                  {
                    id: "aem-uix-examples-cf-console-header-menu-button-weather-forecast",
                    label: "Weather Forecast",
                    icon: "Cloud",
                    onClick: () => {
                      const modalURL = "/index.html#/aem-uix-examples-cf-console-header-menu-button-weather-forecast";

                      guestConnection.host.modal.showUrl({
                        title: "Weather Forecast",
                        url: modalURL,
                        height: "240px",
                        width: "550px",
                      });
                    },
                  },
                  {
                    id: "aem-uix-examples-cf-console-header-menu-button-ui-extensibility",
                    label: "Developer Tools",
                    icon: "Hammer",
                    onClick: () => {
                      const modalURL = "/index.html#/aem-uix-examples-cf-console-header-menu-button-ui-extensibility";

                      guestConnection.host.modal.showUrl({
                        title: "Developer Tools",
                        url: modalURL,
                        height: "360px",
                        width: "550px",
                      });
                    },
                  },
                ],
              },
            ];
          },
        },
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
