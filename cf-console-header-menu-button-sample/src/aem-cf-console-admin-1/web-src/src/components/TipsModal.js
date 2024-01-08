/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Provider,
  Content,
  defaultTheme,
  Button,
  TooltipTrigger,
  Tooltip,
  View
} from "@adobe/react-spectrum";
import "./TipsModal.css";

import { extensionId } from "./Constants";

export default TipsModal = () => {
  const [guestConnection, setGuestConnection] = useState();

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);
    };

    init().catch(console.error);
  }, []);

  const onPressUIExtensibilityTipBtnHandler = (e) => {
    if (tipIndex === 3) {
      setTipIndex(1);
    } else {
      setTipIndex(++tipIndex);
    }
  };

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Content width="100%">
        <TooltipTrigger delay={0}>
          <Button
            variant="accent"
            onPress={onPressUIExtensibilityTipBtnHandler}
          >
            UI Extensibility Tip
          </Button>
          <Tooltip>Click me to see some UI Extensibility tip</Tooltip>
        </TooltipTrigger>

        <View UNSAFE_className="tips-block">
          <View UNSAFE_className={tipIndex === 1 ? "tip" : "tip-hidden"}>
            <div><p>Here is the link to the <a href="https://developer.adobe.com/uix/docs/" target="_blank" referrerPolicy="no-referrer">UI extensibility docs</a> 📚︎</p></div>
          </View>
          <View UNSAFE_className={tipIndex === 2 ? "tip" : "tip-hidden"}>
            <div><p>With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor, including:</p><ol><li>Rich Text Editor Toolbar</li><li>Rich Text Editor Widgets</li><li>Header Menu, and more 🚀</li></ol><p>Check out the <a href="https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/" target="_blank" referrerPolicy="no-referrer">AEM Content Fragment Editor docs</a> for further details 📚︎</p></div>
          </View>
          <View UNSAFE_className={tipIndex === 3 ? "tip" : "tip-hidden"}>
            <div><p>Contact your Adobe account manager to get help with your first extension. 🤝︎</p></div>
          </View>
        </View>

        <Button variant="primary" onPress={onCloseHandler} position="fixed" bottom="0px" right="8px">
          Close
        </Button>
      </Content>
    </Provider>
  )
};
