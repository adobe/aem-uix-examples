/*
 * <license header>
 */

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import { Provider, Content, defaultTheme, View } from "@adobe/react-spectrum";
import { extensionId, localStorageKeySelectedProducts } from "./constants";
import ProductPicker from "./ProductPicker";
import { getCategories, getProducts } from "../catalog-service/catalog-service";
import useConfig from "./useConfig";
import Spinner from "./Spinner";
import ExtensionError from "./ExtensionError";

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);
  // by default should be null, @see a rendering condition "{guestConnection && config ? ("
  const [config, setConfig] = useState(null);

  useEffect(() => {
    (async () => {
      const connection = await attach({
        id: extensionId,
      });
      setGuestConnection(connection);

      const config = await useConfig(connection, setError);
      setConfig(config);
    })().catch((e) => {
      console.log("Extension got the error during initialization:", e);
      setError("Extension got the error during initialization");
    });
  }, []);

  useEffect(() => {
    const productFieldValue = localStorage.getItem(localStorageKeySelectedProducts);
    const selectedProducts = productFieldValue?.split(',').map((item) => item);
    if (selectedProducts) {
      setSelectedProducts(selectedProducts);
    }
  }, []);

  const onConfirm = (products) => {
    localStorage.setItem(localStorageKeySelectedProducts, products.join(","));
    onCancel();
  };

  const onCancel = () => {
    guestConnection.host.modal.close();
  };

  if (error) {
    return (
      <ExtensionError error={error} />
    );
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content>
        {guestConnection && config ? (
          <ProductPicker
            config={config}
            getCategories={getCategories}
            getProducts={getProducts}
            onConfirm={onConfirm}
            onCancel={onCancel}
            selectedProducts={selectedProducts}
          />
        ) : (
          <View width="97%" height="100%">
            <Spinner />
          </View>
        )}     
      </Content>
    </Provider>
  );
}
