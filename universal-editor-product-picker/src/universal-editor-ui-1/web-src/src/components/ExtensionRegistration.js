/*
 * <license header>
 */
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      debug: true,
      methods: {
        canvas: {
          getRenderers() {
            const dataType = guestConnection.configuration?.["component-type"] || "product_picker";

            return [
              {
                extension: 'uixproductpicker',
                dataType: dataType,
                url: '/index.html#/product-field',
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
