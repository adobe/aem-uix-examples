/*
 * <license header>
 */

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

// This function is called when the extension is registered with the host and runs in an iframe in the Content Fragment Editor browser window.
function ExtensionRegistration() {
  const onClickHandler = () => {
    let originalContent = "";
    const messages = [
      "<div><p>Welcome to the extension journey! 🚀 Click once more to discover the UI extensibility docs. 📚︎</p></div>",
      "<div><p>Here is the link to the <a href=\"https://developer.adobe.com/uix/docs/\" target=\"_blank\" referrerpolicy=\"no-referrer\">UI extensibility docs</a>. One more click to explore further! 🕵️</p></div>",
      "<div><p>With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor, including:</p><ol><li>Rich Text Editor Toolbar</li><li>Rich Text Editor Widgets</li><li>Header Menu, and more.</li></ol><p>Check out the <a href=\"https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/\" target=\"_blank\" referrerpolicy=\"no-referrer\">AEM Content Fragment Editor docs</a> for further details.</p></div>",
      "<div><p>Contact your Adobe account manager to get help with your first extension. 🤝︎</p></div>",
      "<div><p>Click again to return to the original content. ✅︎</p></div>",
    ];
    const messagesCount = messages.length;
    const messagesCopy = [...messages];
    return (state) => {
      if (messages.length === messagesCount) {
        originalContent = state.html;
      }
      if (messages.length > 0) {
        return [{
          type: "insertContent",
          value: messages.shift(),
        }];
      } else {
        messages.push(...messagesCopy);
        return [{
          type: "replaceContent",
          value: originalContent,
        }];
      }
    }
  }
  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        rte: {
          getCustomButtons: () => ([
            // RTE Toolbar custom button
            {
              id: "aem-extensibility-cf-editor-rte-toolbar-button",
              tooltip: "Unlock the power of extensibility in the Content Fragment Editor - explore enhanced text customization with a custom toolbar button for the Rich Text Editor",
              icon: "Plug",
              onClick: onClickHandler(),
            },
          ]),
        }
      }
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
