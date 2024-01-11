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

const CustomizedField = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [value, setValue] = useState("");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);

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
        <View>
          <TextField
            value={value}
            isRequired={fieldData.required}
            label={fieldData.fieldLabel}
            name={fieldData.name}
            maxLength={fieldData.maxLength}
            onChange={onChangeHandler}
            width="100%"
            marginBottom="size-100"
          />
          <Flex alignItems="center" UNSAFE_className="info-block">
            <Info aria-label="Info" size="S" marginEnd={5}/>
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
