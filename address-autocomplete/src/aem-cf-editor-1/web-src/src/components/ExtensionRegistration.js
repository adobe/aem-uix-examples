/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { getAddressAutocompleteFieldName } from "../web-config";
import metadata from '../../../../app-metadata.json';

function ExtensionRegistration() {
  const init = async () => {
    await register({
      id: extensionId,
      metadata,
      methods: {
        field: {
          getDefinitions: () => {
            return [
              {
                fieldNameExp: `^${getAddressAutocompleteFieldName()}`,
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
