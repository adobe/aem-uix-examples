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
import { extensionId } from "./Constants";
import Box from '@spectrum-icons/workflow/Box';

const CifField = function () {
  const [guestConnection, setGuestConnection] = useState();
  const [value, setValue] = useState('');
  const fieldRef = useRef();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'selectedProduct' && fieldRef.current) {
        setValue(event.newValue);
        fieldRef.current.onChange(event.newValue);
      }
    };

    const init = async () => {
      const connection = await attach({
        id: extensionId,
      });

      setGuestConnection(connection);
      setValue(await connection.host.field.getValue());

      fieldRef.current = connection.host.field;
      window.addEventListener('storage', handleStorageChange);
    };

    init().catch((e) =>
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
};

export default CifField;
