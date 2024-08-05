/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import useConfig from "./useConfig";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      debug: true,
      methods: {
        canvas: {
          getRenderers() {
            const config = useConfig(guestConnection, () => {});
            return [
              {
                extension: 'uixproductpicker',
                dataType: "text",
                url: '/index.html#/product-field',
                icon: 'OpenIn',
              },
            ];
          },
        },
      },
    });

    console.log("registered");
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
