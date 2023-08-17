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
      methods: {

        rte: {
           getWidgets: () => ([
             // @todo YOUR RTE WIDGETS DECLARATION SHOULD BE HERE
             {
               id: "dynamic-values",
               label: "Dynamic Values",
               url: "/index.html#/dynamic-values-widget",
             },
           ]),

           getBadges: () => ([
             // @todo YOUR RTE BADGES DECLARATION SHOULD BE HERE
             {
               id: "placeholder",
               prefix: "{",
               suffix: "}",
               backgroundColor: "#D6F1FF",
               textColor: "#54719B",
             },
           ]),

          //  removeButtons: () => [
          //   { id: "paste" },
          //   { id: "formatselect" },
          //   { id: "table" },
          //   { id: "bold" },
          //   { id: "italic" },
          //   { id: "backcolor" },
          //   { id: "aligncenter" },
          //   { id: "alignjustify" },
          //   { id: "alignleft" },
          //   { id: "alignnone" },
          //   { id: "alignright" },
          //   { id: "bullist" },
          //   { id: "numlist" },
          //   { id: "outdent" },
          //   { id: "indent" },
          //   { id: "assetpicker" },
          // ],
        }
      }
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
