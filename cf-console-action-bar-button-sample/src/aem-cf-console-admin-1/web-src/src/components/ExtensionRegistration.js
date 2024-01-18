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
                'icon': 'SelectionChecked',
                onClick(selections) {
                  console.log(selections);
                  const selectionIds = selections.map(selection => selection.fragmentId);
                  const modalURL = "/index.html#" + generatePath(
                    "/content-fragment/:selection/click-me-modal",
                    {
                      // Set the :selection React route parameter to an encoded, delimited list of ids of the selected content fragments
                      selection: encodeURIComponent(selectionIds.join('|'))
                    }
                  );
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Action Bar Extension Demo",
                    url: modalURL,
                    fullscreen: true
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
