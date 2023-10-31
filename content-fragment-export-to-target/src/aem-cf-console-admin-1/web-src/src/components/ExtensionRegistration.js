/*
 * <license header>
 */

import { generatePath } from "react-router";
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { triggerExportToAdobeTarget, triggerDeleteFromAdobeTarget } from "../utils";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        actionBar: {
          getButtons() {
            return [
              {
                'id': 'export-to-adobe-target-offers',
                'label': 'Export to Adobe Target Offers',
                'icon': 'Targeted',
                onClick: async (selections) => {
                  const hasUnpublished = typeof selections.find(cf => cf.status !== "published") !== "undefined";
                  if (!hasUnpublished) {
                    guestConnection.host.progressCircle.start();
                    try {
                      const exported = await triggerExportToAdobeTarget(
                        guestConnection.sharedContext.get('auth').imsToken,
                        {
                          fragments: selections.map(cf => cf.id)
                        }
                      );
                      
                      guestConnection.host.progressCircle.stop()
                      if (exported.succeed) {
                        guestConnection.host.toaster.display({
                            variant: "positive",
                            message: "Selected content fragments have been successfully synced with Adobe Target.",
                        })
                      }
                      if (exported.failed) {
                        guestConnection.host.toaster.display({
                          variant: "negative",
                          message: 'Sync with Adobe Target failed. Please make sure CF offer is not being used in activity!'
                        })  
                      }
                    } catch (e) {
                      console.log(e);
                      guestConnection.host.progressCircle.stop()
                      guestConnection.host.toaster.display({
                        variant: "negative",
                        message: 'Sync with Adobe Target failed.'
                      })
                    }
                    return;
                  }

                  const batchId = `cf2at_batch_${Math.random().toString().substring(2, 7)}`;
                  sessionStorage.setItem(batchId, JSON.stringify(
                    selections.map(cf => {
                      return {id: cf.id, title: cf.title, status: cf.status};
                    })
                  ));
                  guestConnection.host.modal.showUrl({
                    title: "Export to Adobe Target",
                    url: "/index.html#" + generatePath("/content-fragment/:batchId/export-to-adobe-target-offers-modal", {
                      batchId: encodeURIComponent(batchId),
                    }),
                    width: "650px",
                    height: "auto",
                    isDismissable: true
                  });
                },
              },
              {
                'id': 'delete-in-adobe-target',
                'label': 'Delete in Adobe Target',
                'icon': 'Target',
                onClick(selections) {
                  
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
