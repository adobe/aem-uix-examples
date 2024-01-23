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

import React, { useEffect, useState, useCallback, useRef } from "react";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {
  Flex, Provider, View, TextField, Text, lightTheme
} from "@adobe/react-spectrum";
import Info from '@spectrum-icons/workflow/Info';
import "./CustomizedField.css";

const countWords = (sentence) => {
  const trimmedString = sentence.trim();
  if (trimmedString === '') {
    return 0;
  }
  const words = trimmedString.split(/\s+/);
  return words.length;
};

const wait = async (timeout) => new Promise(
  (resolve) => setTimeout(() => resolve(true), timeout * 1000)
);

const CustomizedField = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [validationState, setValidationState] = useState("invalid");
  const [value, setValue] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // A workaround for fixing an issue with the right scroll bar.
  const heightRef = useRef(0);
  const containerRef = useCallback(async (node) => {
    if (node !== null && guestConnection !== null) {
      const height = Number((document.body.clientHeight).toFixed(0)) + 30; // we add extra 10px
      if (heightRef.current !== height) {
        heightRef.current = height;
        await wait(1); // we need to wait for some time to ensure that setHeight() is available for use
        await guestConnection.host.field.setHeight(height);
      }
    }
  }, [guestConnection]);

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
      setWordCount(countWords(defaultValue));
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
    const count = countWords(v);
    setWordCount(count);
    guestConnection.host.field.onChange(v);
  };

  return (
    <Provider theme={lightTheme} colorScheme="light">
      {fieldData.ready &&
        <View
          ref={containerRef}
          marginBottom="size-225"
        >
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
          <Flex alignItems="center" UNSAFE_className="info-block">
            <Info aria-label="Info" size="S" marginEnd="size-65" />
            <Text>
              {wordCount === 0
                ? "No words entered yet. Add some text!"
                : `You've entered ${wordCount} ${wordCount === 1 ? 'word' : 'words'}.`}
            </Text>
          </Flex>
        </View>
      }
    </Provider>
  );
}

export default CustomizedField;
