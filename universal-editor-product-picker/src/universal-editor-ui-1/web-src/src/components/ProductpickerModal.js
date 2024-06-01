/*
 * <license header>
 */

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import { Provider, Content, defaultTheme } from "@adobe/react-spectrum";
import { extensionId, localStorageKeySelectedProducts } from "./Constants";
import ProductPicker from "./ProductPicker";
import { getCategories, getProducts } from "../commerce";

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const config = {'commerce-root-category-id': "2", "selectionMode": "multiple"};

  const onConfirm = (products) => {
    localStorage.setItem(localStorageKeySelectedProducts, products);
    onCancel();
  };

  const onCancel = () => {
    guestConnection.host.modal.close();
  };

  useEffect(() => {
    (async () => {
      const connection = await attach({
        id: extensionId,
      });
      setGuestConnection(connection);
    })().catch((e) =>
      console.log("Extension got the error during initialization:", e)
    );
  }, []);

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content>
        <ProductPicker
          config={config}
          getCategories={getCategories}
          getProducts={getProducts}
          onConfirm={onConfirm}
          onCancel={onCancel}
          selectedProducts={[]}
        />
      </Content>
    </Provider>
  );
}
