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

import React, { useEffect, useState } from "react";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {
  Provider, View, TextField, Text, lightTheme
} from "@adobe/react-spectrum";
import "./CustomizedField.css";

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
    };

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
          {!isValid && <View marginBottom="size-100" UNSAFE_className="validation-error">Start each word with an uppercase letter.</View>}
          <View marginBottom="size-100">
            <Text>
              Enter text with each word capitalized to meet validation requirements.
            </Text>
          </View>
        </View>
      }
    </Provider>
  );
}

export default CustomizedField;
