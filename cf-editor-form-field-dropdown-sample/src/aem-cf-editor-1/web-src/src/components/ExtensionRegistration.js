/*
 * <license header>
 */

import { generatePath } from "react-router";
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  console.log("await guestConnection?.host init")

  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        field: {
          getDefinitions: () => ([
            {
              fieldNameExp: '^label01',
              url: "/#/dropdown-route",
              overlay: true,
            },
          ]),
          getProperties: async () => {
            return [
              {
                fieldNameExp: '^fieldLabel$',
                onChange: (value) => {},
                disabled: true
              }
            ];
          },
        },
      }
    });

  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
