/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        headerMenu: {
          getButtons() {
            return [
              // @todo YOUR HEADER BUTTONS DECLARATION SHOULD BE HERE
              {
                id: 'testCustomButtonHeaderMenu',
                label: 'Custom Header Button',
                icon: 'OpenIn',
                onClick() {
                  const modalURL = "/index.html#/testcustombuttonheadermenu-modal";
                  console.log("Modal URL: ", modalURL);

                  guestConnection.host.modal.showUrl({
                    title: "testCustomButtonHeaderMenu",
                    url: modalURL,
                  });
                },
              },
            ];
          },
        },
        rte: {
           getWidgets: () => ([
             // @todo YOUR RTE WIDGETS DECLARATION SHOULD BE HERE
             {
               id: "rtewidgetcfeditor",
               label: "RTEWidgetCFEditor",
               url: "/index.html#/rtewidgetcfeditor-widget",
             },
           ]),

           getBadges: () => ([
             // @todo YOUR RTE BADGES DECLARATION SHOULD BE HERE
             {
               id: "testrtebadgecfeditor",
               prefix: "!",
               suffix: "!",
               backgroundColor: "#D6F1FF",
               textColor: "#54719B",
             },
           ]),

          getCustomButtons: () => ([
             // @todo YOUR RTE TOOLBAR BUTTONS DECLARATION SHOULD BE HERE
             {
               id: "test-rte-cfebutton",
               tooltip: "This button is rendered by an extension for CF Editor",
               icon: 'Airplane',
               onClick: (state) => {
                 return [{
                   type: "replaceContent",
                   value: state.html + "<p> The CF Editor Extension received the click </p>"
                 }];
               },
             },
          ]),
          getColors() {
            return {
              allowedColors: [
                "FFCC00", "Yellow",
                "0000CC", "Blue",
                  "FF0000", "Red",
                  "00FF00", "Green",
              ],
              isAllowedCustomColors: true,
            };
          },
        },
        field: {
          getDefinitions: () => {
            return [
              {
                fieldNameExp: '^address_autocomplete$',
                url: '/#/address-autocomplete-field',
              },
            ];
          },
        },
        rightPanel: {
          addRails() {
            return [
              {
                extension: extensionId,
                id: "cfEditorTestRail1",
                header: "Last Changes",
                url: '/index.html#/rail/1',
                icon: 'Export',
              }
            ];
          },
        },

      }
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
