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

const defaultExtensionManifest = {
  "name": "Content Hub Assets Details Panel Test Extension",
  "id": "aem-contenthub-assets-details-test-extension",
  "description": "Test Extension for Content Hub Assets Details Panel",
  "version": "0.0.1"
}

const customExtensionManifest = {
  "name": "Content Hub Assets Details Panel Test Extension",
  "id": "aem-contenthub-assets-details-test-extension",
  "description": "Test Extension for Content Hub Assets Details Panel",
  "version": "0.0.1",
  "assetDetailsTabPanels": [
    {
      "id": "p1",
      "tooltip": "Panel 1",
      "title": "Title 1",
      "icon": "Attributes",
      "componentName": "PanelP1"
    },
    {
      "id": "p2",
      "tooltip": "Panel 2",
      "title": "Title 2",
      "icon": "Chat",
      "componentName": "PanelP2"
    }
  ],
  "runtimeActions": [
    {
      "name": "attributes"
    },
    {
      "name": "chat"
    }
  ]
}

module.exports = {
  defaultExtensionManifest,
  customExtensionManifest,
}