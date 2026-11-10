import { register } from "@adobe/uix-guest";
import { Text } from "@adobe/react-spectrum";

function ExtensionRegistration() {
  const init = async () => {
    const guestConnection = await register({
      id: "com.sbsa.assets.console.extension.aem-inbox-uix",
      methods: {
        headerMenu: {
          async getButtons({ context }) {
            if (context !== 'assets') {
              return [];
            }
            return [
              {
                id: 'aem-inbox',
                label: 'Inbox',
                icon: 'Bell',
                variant: 'primary',
                onClick: async () => {
                  await guestConnection.host.modal.openDialog({
                    title: 'Inbox',
                    contentUrl: '/#inbox-modal',
                    type: 'fullscreen',
                  });
                },
              },
            ];
          },
        },
        detailSidePanel: {
          getPanels() {
            return [
              {
                'id': 'inbox-uix',
                'tooltip': 'Inbox',
                'icon': 'Extension',
                'title': 'Inbox',
                'contentUrl': '/#inbox-panel',
                'reloadOnThemeChange': 'true',
              }
            ];
          }
        }
      },
    });
  };
  init().catch(console.error);
  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
