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

import React, { useEffect, useState, useRef } from "react";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {
  Provider, View, Flex, TextField, Button, lightTheme
} from "@adobe/react-spectrum";

const messages = [
  {
    value: "Welcome to the extension journey! Click once more to discover the UI extensibility docs.",
    tip: "<div><p>Welcome to the extension journey! 🚀 Click once more to discover the UI extensibility docs. 📚︎</p></div>",
  },
  {
    value: "The following is the link to the UI extensibility docs, https://developer.adobe.com/uix/docs/",
    tip: "<div><p>Here is the link to the <a href=\"https://developer.adobe.com/uix/docs/\" target=\"_blank\" referrerpolicy=\"no-referrer\">UI extensibility docs</a>. One more click to explore further! 🕵️</p></div>",
  },
  {
    value: "With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor!",
    tip: "<div><p>With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor, including:</p><ol><li>Rich Text Editor Toolbar</li><li>Rich Text Editor Widgets</li><li>Header Menu, and more.</li></ol><p>Check out the <a href=\"https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/\" target=\"_blank\" referrerpolicy=\"no-referrer\">AEM Content Fragment Editor docs</a> for further details.</p></div>",
  },
  {
    value: "Contact your Adobe account manager to get help with your first extension.",
    tip: "<div><p>Contact your Adobe account manager to get help with your first extension. 🤝︎</p></div>",
  },
  {
    value: "Click again to return to the original content.",
    tip: "<div><p>Click again to return to the original content. ✅︎</p></div>",
  },
];

function CustomizedField() {
  const [guestConnection, setGuestConnection] = useState();
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [validationState, setValidationState] = useState("invalid");
  const [value, setValue] = useState();
  const [tip, setTip] = useState();
  const messagesRef = useRef([...messages]);

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);

      // configure a validation state subscriber
      await connection.host.field.onValidationStateChange(
        (state) => setValidationState(state)
      );

      const defaultValue = await connection.host.field.getDefaultValue();
      const fieldModel = await connection.host.field.getModel();
      const required = fieldModel.required ?? false;
      const fieldLabel = fieldModel.fieldLabel ?? "";
      const name = fieldModel.name;
      const maxLength = fieldModel.maxLength ?? "";
      setValue(defaultValue);
      setFieldData({
        defaultValue,
        required,
        fieldLabel,
        name,
        maxLength,
        ready: true,
      });
    }

    init().catch(console.error);
  }, []);

  const onChangeHandler = (v) => {
    setValue(v);
    guestConnection.host.field.onChange(v);
  };

  const onPressUIExtensibilityBtnHandler = (e) => {
    if (messagesRef.current.length > 0) {
      const item = messagesRef.current.shift();
      setValue(item.value);
      guestConnection.host.field.onChange(item.value);
      setTip(item.tip);
    } else {
      messagesRef.current = [...messages];
      setValue(fieldData.defaultValue);
      guestConnection.host.field.onChange(fieldData.defaultValue);
      setTip(undefined);
    }
  };

  const onPressResetBtnHandler = () => {
    messagesRef.current = [...messages];
    setValue(fieldData.defaultValue);
    guestConnection.host.field.onChange(fieldData.defaultValue);
    setTip(undefined);
  };

  return (
    <Provider theme={lightTheme} colorScheme="light">
      {fieldData.ready &&
        <View>
          <TextField
            value={value}
            isRequired={fieldData.required}
            label={fieldData.fieldLabel}
            name={fieldData.name}
            maxLength={fieldData.maxLength}
            onChange={onChangeHandler}
            validationState={validationState}
            width="100%"
            marginBottom="size-100"
          />
          <TextField
            defaultValue={fieldData.defaultValue}
            isDisabled={true}
            isReadOnly={true}
            label="Original Content"
            width="100%"
            marginBottom="size-100"
          />
          <Flex gap="size-100" marginBottom="size-100">
            <Button variant="accent" height="size-500" width="size-2400" onPress={onPressUIExtensibilityBtnHandler}>
              Click me to see UI Extensibility in action!
            </Button>
            <Button variant="primary" height="size-500" width="size-2400" onPress={onPressResetBtnHandler}>
              Reset to the original content
            </Button>
          </Flex>
          {tip &&
            <div dangerouslySetInnerHTML={{__html: tip}} style={{marginBottom: "8px"}} />
          }
        </View>
      }
    </Provider>
  );
}

export default CustomizedField;
