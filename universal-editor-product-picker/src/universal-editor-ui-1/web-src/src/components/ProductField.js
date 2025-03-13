/*
 * <license header>
 */

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Provider,
  defaultTheme,
  ActionButton,
  LabeledValue,
  useDragAndDrop,
  Item,
  Grid,
  ListView,
  View,
  Flex,
  TextField,
} from "@adobe/react-spectrum";
import { extensionId, localStorageKeySelectedProducts } from "./constants";
import {
  convertProductSelectionsFromStringToList,
  convertProductSelectionsFromListToString,
  reOrderSelections,
} from "./selections-utils";
import Box from '@spectrum-icons/workflow/Box';

export default function () {
  const [isLoading, setIsLoading] = useState(true);
  const [guestConnection, setGuestConnection] = useState();
  const [selections, setSelections] = useState([]);
  const [modelName, setModelName] = useState('');
  const [model, setModel] = useState({ name: '', value: '' });
  const [value , setValue] = useState('');

  useEffect(() => {
    (async () => {
      const guestConnection2 = await attach({
        id: extensionId,
      });
      setGuestConnection(guestConnection2);

      await guestConnection2.host.field.setStyles({
        current: { paddingBottom: 10 },
        parent: { paddingBottom: 10 },
      });

      setValue(await guestConnection2.host.field.getValue());
      setModel(await guestConnection2.host.field.getModel());
      setIsLoading(false);
      const modelName = await guestConnection2.configuration?.["model-name"] || "sku";
      setModelName(modelName);
      const currentProducts = await guestConnection.host.field.getDefaultValue();
      setSelections(convertProductSelectionsFromStringToList(currentProducts));
    })().catch((e) =>
      console.log("Extension got the error during initialization:", e)
    );
  }, []);

  const onChangeHandler = (v) => {
    guestConnection.host.field.onChange(v);
  }




  return (
    <Provider theme={defaultTheme}>
      <View padding="size-100">
        {isLoading ? (
          <View width="97%" height="100%">
                    <h1>Loading...</h1>
                </View>

        )
        : (
          <TextField label={model.name} defaultValue={value} onChange={onChangeHandler} />
        )
        }
        </View>
    </Provider>
  );
};
