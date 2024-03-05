/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { useEffect } from "react";
import { Text } from "@adobe/react-spectrum";
import { extensionId } from "./Constants";
import { register } from "@adobe/uix-guest";

function ExtensionRegistration() {
  useEffect(() => {
    const init = async () => {
      const registrationConfig = {
        id: extensionId,
        methods: {
          rightPanel: {
            addRails() {
              return [
                {
                  id: "taskManagement",
                  header: "Task Management",
                  url: "https://experience.adobe.com/solutions/aem-sites-reverie-sites-workfront-integration/static-assets/resources/embed.html?route=TaskManagementWidget",
                  hotkey: "W",
                  icon: "TaskList",
                },
              ];
            },
          },
        },
      };
      await register(registrationConfig);
    };
    init().catch(console.error);
  }, []);
  return <Text>IFrame for integration with Host...</Text>;
}

export default ExtensionRegistration;
