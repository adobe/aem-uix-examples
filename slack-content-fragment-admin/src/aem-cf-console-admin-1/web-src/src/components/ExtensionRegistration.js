/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

 import { generatePath } from "react-router";
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
        actionBar: {
          getButtons() {
            return [
              {
                'id': 'export-to-slack',
                'label': 'Export to Slack',
                'icon': 'Export',
                onClick(selections) {
                  
                  const selectedFrags = {
                    selectedContentFragments: selections.map((selection) => ({
                      'id': selection.id, 
                      'modelId': selection.model.id, 
                      'folderId': selection.folderId, 
                      'name': selection.name, 
                      'title': `${selection.title} (copy)`,
                    }))
                  }
                  
                  const modalURL = "/index.html#" + generatePath("/content-fragment/:fragments/export-to-slack-modal", {
                      fragments: encodeURIComponent(JSON.stringify(selectedFrags, null, 2))
                    })
                  console.log("Modal URL: ", modalURL);
                  
                  guestConnection.host.modal.showUrl({
                    title: "Export to Slack",
                    url: modalURL,
                    loading: true,
                    width: "500px",
                    height: "300px"
                  });
                },
              },
            ];
          },
        },
        headerMenu: {
          getButtons() {
            return [
              {
                'id': 'slack-settings',
                'label': 'Slack Settings',
                'icon': 'Settings',
                onClick() {
                  const modalURL = "/index.html#/slack-settings-modal";
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Slack Settings",
                    url: modalURL,
                    loading: true,
                    width: "500px",
                    height: "300px"
                  });
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
