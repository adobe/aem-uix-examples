/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  const init = async () => {
    await register({
      id: extensionId,
      methods: {
        canvas: {
          getRenderers() {
            return [
              {
                extension: 'uix-product-picker',
                dataType: 'text',
                url: '/index.html#/product-field',
                icon: 'OpenIn',
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
