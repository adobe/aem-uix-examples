/*
 * <license header>
 */

import React, { useState, useEffect, useRef } from "react";
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
import { extensionId, localStorageKeySelectedProducts } from "./constants";
import Box from '@spectrum-icons/workflow/Box';

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const [productFieldValue, setProductFieldValue] = useState('');
  const fieldRef = useRef();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === localStorageKeySelectedProducts && fieldRef.current) {
        setProductFieldValue(event.newValue);
        fieldRef.current.onChange(event.newValue);
      }
    };

    (async () => {
      const connection = await attach({
        id: extensionId,
      });
      setGuestConnection(connection);

      const productFieldValue = await connection.host.field.getValue();
      setProductFieldValue(productFieldValue);
      localStorage.setItem(localStorageKeySelectedProducts, productFieldValue);

      fieldRef.current = connection.host.field;
      window.addEventListener('storage', handleStorageChange);
    })().catch((e) =>
      console.log("Extension got the error during initialization:", e)
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
            <TextField value={productFieldValue} flexGrow={1} isReadOnly />
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
};
