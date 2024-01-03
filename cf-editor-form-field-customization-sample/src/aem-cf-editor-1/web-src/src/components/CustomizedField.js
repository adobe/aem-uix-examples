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
  Provider, View, TextField, Button, TooltipTrigger, Tooltip, lightTheme
} from "@adobe/react-spectrum";
import "./CustomizedField.css";

const tips = [
  "The following is the link to the UI extensibility docs, https://developer.adobe.com/uix/docs/ 📚︎",
  "With the UI Extensibility framework, you can extend various components within this AEM Content Fragment Editor, including: Rich Text Editor Toolbar, Rich Text Editor Widgets, Header Menu, and more 🚀 Check out https://developer.adobe.com/uix/docs/services/aem-cf-editor/api/ for further details.",
  "Contact your Adobe account manager to get help with your first extension. 🤝︎",
];

const validateFirstLetters = (sentence) => {
  // Split the sentence into words
  const words = sentence.split(" ");

  // Check if the first letter of each word is uppercase
  for (const i = 0; i < words.length; i++) {
    if (words[i].charAt(0) !== words[i].charAt(0).toUpperCase()) {
      return false;
    }
  }

  return true;
};

const CustomizedField = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [validationState, setValidationState] = useState("invalid");
  const [value, setValue] = useState("");
  // our custom validation status
  const [isValid, setIsValid] = useState(false);
  const tipsRef = useRef([...tips]);

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
      setIsValid(validateFirstLetters(defaultValue));
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
    const isValid = validateFirstLetters(v);
    setIsValid(isValid);
    if (isValid) {
      guestConnection.host.field.onChange(v);
    }
  };

  const onPressUIExtensibilityTipBtnHandler = (e) => {
    if (tipsRef.current.length === 0) {
      tipsRef.current = [...tips];
    }
    guestConnection.host.toaster.display({
      variant: "info",
      message: tipsRef.current.shift(),
      timeout: 5000,
    });
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
            validationState={(validationState === "valid" && isValid) ? "valid" : "invalid"}
            width="100%"
            marginBottom="size-100"
          />
          {!isValid && <View marginBottom="size-100" UNSAFE_className="validation-error">First letters must be uppercase.</View>}
          <View marginBottom="size-100" UNSAFE_className="info-block">
            This customized AEM CF Editor form field showcases the ability to incorporate custom elements, display toasts, and perform extra actions on form field values, like adding additional validation to ensure that all words begin with an uppercase letter.
          </View>
          <TooltipTrigger delay={0}>
            <Button
              aria-label="Click me to see some UI Extensibility tip"
              variant="accent"
              onPress={onPressUIExtensibilityTipBtnHandler}
            >
              UI Extensibility Tip
            </Button>
            <Tooltip>Click me to see some UI Extensibility tip</Tooltip>
          </TooltipTrigger>
        </View>
      }
    </Provider>
  );
}

export default CustomizedField;
