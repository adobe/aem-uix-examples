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
import { getUserGroupData } from "../utils";
import metadata from '../../../../app-metadata.json';

let userGroups = [];
let loadingState = "none";
const memberIn = async (groupName, connection, config) => {
  if (loadingState === "none") {
    const auth = connection.sharedContext.get("auth");
    const host = connection.sharedContext.get("aemHost");
    try {
      loadingState = "loading";
      userGroups = await getUserGroupData(auth.imsToken, host, auth.imsOrg);
      loadingState = "loaded";
    } catch (error) {
      loadingState = "none";
    }
  }

  userGroups.memberOf = userGroups.memberOf || [];
  return !!userGroups.memberOf.find((group) => group.name === groupName) ? config : null;
}

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      metadata,
      methods: {
        headerMenu: {
          async getButtons() {
            const buttons = [
              await memberIn("Extensibility", guestConnection, {
                id: "my.company.export-button",
                label: "supermans",
                icon: 'Export',
                onClick: () => {
                  console.log('supermans button has been pressed.');
                },
              }),
              await memberIn("supermansNot", guestConnection, {
                id: "my.company.export-button1",
                label: "supermansNot",
                icon: 'Export',
                onClick: () => {
                  console.log('supermansNot button has been pressed.');
                },
              }),
            ].filter( Boolean );
            return buttons;
          },
        },
      }
    });

  };
  init().catch((error) => console.error(error));

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
