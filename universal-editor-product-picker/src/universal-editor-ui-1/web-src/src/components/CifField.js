/*
 * <license header>
 */

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Provider,
  Content,
  defaultTheme,
  Flex,
  TextField,
  ActionButton,
  LabeledValue,
  Tooltip,
  TooltipTrigger,
} from "@adobe/react-spectrum";
import { extensionId } from "./Constants";
import Box from '@spectrum-icons/workflow/Box';

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const [model, setModel] = useState({});
  const [value, setValue] = useState('');

  const handleStorageChange = (event) => {
    // console.log("========= guestConnection ==========");
    // console.log(guestConnection);
    // if (!guestConnection) {
    //   return;
    // }
    if (event.key === 'selectedProduct') {
      setValue(event.newValue);
      // guestConnection.host.field.onChange(event.newValue);
    }
  };

  const init = async () => {
    const connection = await attach({
      id: extensionId,
    });
    setGuestConnection(connection);
  };

  useEffect(() => {
    init().catch((e) =>
      console.log("Extension got the error during initialization:", e)
    );
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get basic state from guestConnection
  useEffect(() => {
    if (!guestConnection) {
      return;
    }
    const getState = async () => {
      setModel(await guestConnection.host.field.getModel());
      setValue(await guestConnection.host.field.getValue());
    };
    getState().catch((e) => console.error("Extension error:", e));
  }, [guestConnection]);

  const showModal = () => {
    guestConnection.host.modal.showUrl({
      title: "Product Picker",
      url: "/index.html#/product-picker-modal",
      width: "80vw",
      height: "70vh",
    });
  };

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content>
        <Flex direction='column'>
          <LabeledValue label="SKU" value='' />
          <Flex direction='row'>
            <TextField value={value} flexGrow={1} isReadOnly />
            <TooltipTrigger crossOffset={25} placement="end bottom">
              <ActionButton
                aria-label="Select asset"
                onPress={showModal}
                aria-label='select asset'
                marginStart="size-150">
                <Box />
              </ActionButton>
              <Tooltip>Select asset</Tooltip>
            </TooltipTrigger>
          </Flex>
        </Flex>
      </Content>
    </Provider>
  );
}
