/*
 * <license header>
 */

import { generatePath } from "react-router";
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        actionBar: {
          getButtons() {
            return [
              // YOUR ACTION BAR BUTTONS CODE SHOULD BE HERE
              {
                'id': 'click-me',
                'label': 'Click Me',
                'icon': 'PublishCheck',
                onClick(selections) {
                  const modalURL = "/index.html#" + generatePath("/content-fragment/:fragmentId/click-me-modal", {
                    fragmentId: encodeURIComponent(selections[0].id),
                  });
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Click Me",
                    url: modalURL,
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

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
