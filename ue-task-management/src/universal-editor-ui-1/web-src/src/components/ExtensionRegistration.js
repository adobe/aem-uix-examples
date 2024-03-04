/*
 * <license header>
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
                  url: "https://experience-qa.adobe.com/solutions/aem-sites-reverie-sites-workfront-integration/static-assets/resources/embed.html?route=TaskManagementWidget",
                  hotkey: "W",
                  icon: "TaskList",
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
  return <Text>IFrame for integration with Host...</Text>;
}

export default ExtensionRegistration;
