/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  console.log("Address Autocomplete UIX Extension");

  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        field: {
          getDefinitions: () => {
            return [
              {
                fieldTypeExp: '^text-single$',
                fragmentPathExp: '^/content/dam/ui-extensibility/address-autocomplete/',
                fieldNameExp: '^address_autocomplete$',
                url: '/#/address-autocomplete-field',
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
