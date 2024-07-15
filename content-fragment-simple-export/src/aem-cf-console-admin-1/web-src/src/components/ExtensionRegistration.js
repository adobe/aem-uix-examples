/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import actions from '../config.json';
import actionWebInvoke from "../utils.js";
import metadata from '../../../../app-metadata.json';

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      metadata,
      methods: {
        headerMenu: {
          getButtons() {
            return [
              // YOUR HEADER BUTTONS CODE SHOULD BE HERE
              {
                'id': 'uix-examples.cf-simple-export',
                'label': 'UIX CF Export',
                'icon': 'Export',
                variant: 'action',
                async onClick() {
                  guestConnection.host.toaster.display({
                    variant: "positive",
                    message: "Export generation has started. The download will begin automatically once the process is complete.",
                    timeout: 3000,
                  });

                  const filters = await guestConnection.host.fragmentSelector.getFilters();
                  console.log('Filters: ', JSON.stringify(filters));

                  const presignUrl = await actionWebInvoke(
                      actions['export-content-fragments'],
                      {},
                      {
                        filters,
                        authConfig: guestConnection.sharedContext.get('auth'),
                        aemHost: guestConnection.sharedContext.get('aemHost'),
                      },
                      { method: 'POST' }
                  );

                  if (presignUrl.error) {
                    guestConnection.host.toaster.display({
                      variant: "negative",
                      message: "Export generation encountered an error.",
                      timeout: 3000,
                    });
                    return;
                  }
                  window.open(presignUrl);
                },
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
