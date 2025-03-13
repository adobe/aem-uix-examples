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
  Tooltip,
  TooltipTrigger,
  useDragAndDrop,
  Item,
  Grid,
  ListView,
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
  const [guestConnection, setGuestConnection] = useState();
  const [selections, setSelections] = useState([]);
  const [value, setValue] = useState(undefined);
  const [model, setModel] = useState({name: undefined});

  const handleStorageChange = async (event) => {
    const myModel = await guestConnection.host.field.getModel();

    console.log('model', myModel);
    console.log('compare', event.key, myModel.name, sessionStorage.getItem('field'), myModel.name === sessionStorage.getItem('field'))
    if (event.key === localStorageKeySelectedProducts && myModel.name === sessionStorage.getItem('field')) {
      const selectionsAsString = event.newValue;

      saveProductField(selectionsAsString);
      setSelections(convertProductSelectionsFromStringToList(selectionsAsString));
    }
  };

  useEffect(() => {
    (async () => {
      const guestConnectionLocal = await attach({
        id: extensionId,
      });
      setGuestConnection(guestConnectionLocal);

      await guestConnectionLocal.host.field.setStyles({
        current: { paddingBottom: 10 },
        parent: { paddingBottom: 10 },
      });

      setValue(await guestConnectionLocal.host.field.getValue());
      setModel(await guestConnectionLocal.host.field.getModel());

    })().catch((e) =>
      console.log("Extension got the error during initialization:", e)
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!guestConnection) {
        return;
      }

      const selectionsAsString = await guestConnection.host.field.getValue();
      setStorageValue(selectionsAsString);

      const selections = convertProductSelectionsFromStringToList(selectionsAsString);
      setSelections(selections);

      window.addEventListener('storage', handleStorageChange);
    })().catch((e) =>
      console.log("Extension got the error during pre-selected products processing:", e)
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [guestConnection]);

  const saveProductField = (value) => {
    guestConnection.host.field.onChange(value);
  };


  const setStorageValue = (value) => {
    sessionStorage.setItem(localStorageKeySelectedProducts, value);
  };

  const showModal = async () => {
    if (!guestConnection) {
      return;
    }

    sessionStorage.setItem('field', (await guestConnection.host.field.getModel()).name);
    guestConnection.host.modal.showUrl({
      title: "Product Picker",
      url: "/index.html#/product-picker-modal/",
      width: "80vw",
      height: "70vh",
    });
  };

  const { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        return {
          'custom-app-type-reorder': key,
          'text/plain': key,
        };
      });
    },
    acceptedDragTypes: ['custom-app-type-reorder'],
    onReorder: async (e) => {
      const updatedSelections = reOrderSelections(selections, e);
      const selectionsString = convertProductSelectionsFromListToString(updatedSelections);

      setSelections(updatedSelections);
      saveProductField(selectionsString);
      setStorageValue(selectionsString);
    },
    getAllowedDropOperations: () => ['move'],
  });

  const genericOnChange = (v) => {
    guestConnection.host.field.onChange(v);
  }


  const fieldComponent = (model.name == 'sku') ? <>
  <Grid
        areas={[
          "field-label product-picker-button",
          "selected-products-list selected-products-list",
        ]}
        columns={["2fr", "1fr"]}
        alignItems={"center"}
        rowGap={"size-100"}
      >
        <LabeledValue label="Selected Products" value="" gridArea="field-label" />

        <TooltipTrigger crossOffset={25} placement="end bottom" gridArea="product-picker-button">
              <ActionButton onPress={showModal} aria-label="Select Products">
                <Box />
              </ActionButton>
              <Tooltip>Select product</Tooltip>
            </TooltipTrigger>
            <ListView
              items={selections}
              dragAndDropHooks={dragAndDropHooks}
              selectionMode="multiple"
              selectionStyle="highlight"
              width="100%"
              height="100%"
              density="spacious"
              aria-label="Selected Products"
              gridArea="selected-products-list"
            >
              {(item) => <Item>{item.sku}</Item>}
            </ListView>
      </Grid></> : (value) ? <TextField label={model.name} defaultValue={value} onChange={genericOnChange} /> : <>Loading</>;

  return (
    <Provider theme={defaultTheme}>
      {fieldComponent}
    </Provider>
  );
};