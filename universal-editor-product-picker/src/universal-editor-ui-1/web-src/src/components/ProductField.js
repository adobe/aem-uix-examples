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
  
  useEffect(() => {
    (async () => {
      const guestConnection = await attach({
        id: extensionId,
      });
      setGuestConnection(guestConnection);

      await guestConnection.host.field.setStyles({
        current: { paddingBottom: 10 },
        parent: { paddingBottom: 10 },
      });

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

  const handleStorageChange = (event) => {
    if (event.key === localStorageKeySelectedProducts) {
      const selectionsAsString = event.newValue;

      saveProductField(selectionsAsString);
      setSelections(convertProductSelectionsFromStringToList(selectionsAsString));
    }
  };

  const setStorageValue = (value) => {
    localStorage.setItem(localStorageKeySelectedProducts, value);
  };

  const showModal = () => {
    if (!guestConnection) {
      return;
    }
    guestConnection.host.modal.showUrl({
      title: "Product Picker",
      url: "/index.html#/product-picker-modal",
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

  return (
    <Provider theme={defaultTheme}>
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
      </Grid>
    </Provider>
  );
};
