/*
 * <license header>
 */

import { register } from "@adobe/uix-guest";
import { Text } from "@adobe/react-spectrum";

function ExtensionRegistration() {

  const init = async () => {
    const guestConnection = await register({
      id: "com.adobe.ue.extension.preview",
      methods: {
        headerMenu: {
          async getButtons() {
            return [
              {
                id: "com.adobe.ue.extension.preview.menu",
                label: "View",
                icon: 'Visibility',
                subItems: [
                  {
                    id: 'preview',
                    label: 'Preview',
                    onClick: async () => {
                      const editorState = await guestConnection.host.editorState.get();
                      const config = await guestConnection.configuration;
                      const { location } = editorState;
                      console.log(`Preview - ${location}`);
                      window.open(buildURL(location, 'page', JSON.parse(config['env_mappings']), config['org'], JSON.parse(config['url_rules'])), "_blank");
                    },
                  },
                  {
                    id: 'live',
                    label: 'Live',
                    onClick: async () => {
                      const editorState = await guestConnection.host.editorState.get();
                      const config = await guestConnection.configuration;
                      const { location } = editorState;
                      console.log(`Live - ${location}`);
                      window.open(buildURL(location, 'live', JSON.parse(config['env_mappings']), config['org'], JSON.parse(config['url_rules'])), "_blank");
                    },
                  },
                ],
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

function buildURL(authorURL, tier, environmentMappings, org, rules) {
  const url = new URL(authorURL);
  const ref = url.searchParams.get("ref") || "main";
  const tokens = url.pathname.split("/").filter(Boolean);
  const environmentId = environmentMappings[url.host]

  // Remove /content/ghana/
  const [, , repo, ...pathTokens] = tokens;

  // Remove extension from the last path segment
  pathTokens[pathTokens.length - 1] =
    pathTokens[pathTokens.length - 1].replace(/\.[^/.]+$/, "");

  return applyUrlRules(`https://${ref}--${repo}${environmentId}--${org}.aem.${tier}/${pathTokens.join("/")}`, rules);
}

function applyUrlRules(url, rules) {
    for (const [pattern, rule] of Object.entries(rules)) {
        const regex = new RegExp(pattern);

        if (regex.test(url)) {
            url = url.replace(rule.existing, rule.replacement);
        }
    }

    return url;
}

export default ExtensionRegistration;
