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

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        headerMenu: {
          getButtons() {
            return [
              // YOUR HEADER BUTTONS CODE SHOULD BE HERE
              {
                id: "aem-uix-examples-cf-console-header-menu-button",
                label: "Sample Header Button",
                icon: "Plug",
                variant: "secondary",
                subItems: [
                  {
                    id: "aem-uix-examples-cf-console-header-menu-button-insights",
                    label: "Show Insights",
                    icon: "ConfidenceFour",
                    onClick: () => {
                      const modalURL = "/index.html#/aem-uix-examples-cf-console-header-menu-button-insights";

                      guestConnection.host.modal.showUrl({
                        title: "Insights",
                        url: modalURL,
                        height: "320px",
                        width: "550px",
                      });
                    },
                  },
                  {
                    id: "aem-uix-examples-cf-console-header-menu-button-tips",
                    label: "Show Tips",
                    icon: "InfoOutline",
                    onClick: () => {
                      const modalURL = "/index.html#/aem-uix-examples-cf-console-header-menu-button-tips";

                      guestConnection.host.modal.showUrl({
                        title: "Tips",
                        url: modalURL,
                        height: "250px",
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
