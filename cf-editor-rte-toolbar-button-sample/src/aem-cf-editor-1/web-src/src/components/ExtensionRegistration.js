/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useRef } from "react";
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";

const messages = [
  "<div><p>Welcome to the extension journey! 🚀 Click once more to discover the UI extensibility docs. 📚︎</p></div>",
  "<div><p>Here is the link to the <a href=\"https://developer.adobe.com/uix/docs/\" target=\"_blank\" referrerpolicy=\"no-referrer\">UI extensibility docs</a>. One more click to explore further! 🕵️</p></div>",
  "<div><p>With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor, including:</p><ol><li>Rich Text Editor Toolbar</li><li>Rich Text Editor Widgets</li><li>Header Menu, and more.</li></ol><p>Check out the <a href=\"https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/\" target=\"_blank\" referrerpolicy=\"no-referrer\">AEM Content Fragment Editor docs</a> for further details.</p></div>",
  "<div><p>Contact your Adobe account manager to get help with your first extension. 🤝︎</p></div>",
  "<div><p>Click again to return to the original content. ✅︎</p></div>",
];

// This function is called when the extension is registered with the host and runs in an iframe in the Content Fragment Editor browser window.
function ExtensionRegistration() {
  const originalContentRef = useRef(null);
  const messagesRef = useRef([...messages]);

  const onClickHandler = (state) => {
    if (originalContentRef.current === null) {
      originalContentRef.current = state.html;
    }
    if (messagesRef.current.length > 0) {
      return [{
        type: "insertContent",
        value: messagesRef.current.shift(),
      }];
    } else {
      messagesRef.current = [...messages];
      return [{
        type: "replaceContent",
        value: originalContentRef.current,
      }];
    }
  };

  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        rte: {
          getCustomButtons: () => ([
            // RTE Toolbar custom button
            {
              id: "aem-uix-examples-cf-editor-rte-toolbar-button",
              tooltip: "Click to explore the extensibility features",
              icon: "Plug",
              onClick: onClickHandler,
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
