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
                'id': 'custom-action-button',
                'label': 'Custom Action Button',
                'icon': 'PublishCheck',
                '': '',
                onClick(selections) {
                  const modalURL = "/index.html#" + generatePath("/content-fragment/:fragmentId/custom-action-button-modal", {
                    fragmentId: encodeURIComponent(selections[0].id),
                  });
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Custom Action Button",
                    url: modalURL,
                  });
                },
              },
            ];
          },
        },
        headerMenu: {
          getButtons() {
            return [
              // YOUR HEADER BUTTONS CODE SHOULD BE HERE
              {
                'id': 'custom-header-button',
                'label': 'Custom Header Button',
                'icon': 'OpenIn',
                onClick() {
                  const modalURL = "/index.html#/custom-header-button-modal";
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "Custom Header Button",
                    url: modalURL,
                  });
                },
              },
            ];
          },
        },
        contentFragmentGrid: {
          getColumns() {
            return [
              {
                id: "custom-extended-column",
                label: "Extended",
                allowsResizing: true, // optional, by default "false"
                minWidth: 350, // optional, no default value
                showDivider: true, // optional, by default "false"
                render: async function (fragments) {
                  return fragments.reduce((accumulator, fragment) => {
                    accumulator[fragment.id] = 'Extended Column Value';
                    return accumulator;
                  }, {})
                },
              },
            ];
          }
        }
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
