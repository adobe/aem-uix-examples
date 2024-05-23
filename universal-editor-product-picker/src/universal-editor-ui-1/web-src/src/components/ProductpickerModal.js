/*
 * <license header>
 */

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Provider,
  Content,
  defaultTheme,
} from "@adobe/react-spectrum";
import { extensionId } from "./Constants";
import Picker from "./Picker";
import { getItems, getCategories } from "../commerce";


const blocks = {
  'identifier': {
      'key': 'identifier',
      'name': 'Identifier only',
      'output': i => i.isFolder ? i.id : i.sku,
      'selection': 'single',
      'type': 'any',
  },
  'product-list-page': {
      'key': 'product-list-page',
      'name': 'Product List Page',
      'output': i => `<table width="100%" style="border: 1px solid black;">
          <tr>
              <th colspan="2" style="border: 1px solid black; background: lightgray;">Product List Page</th>
          </tr>
          <tr>
              <td style="border: 1px solid black">category</td>
              <td style="border: 1px solid black">${i.id}</td>
          </tr>
      </table>`,
      'selection': 'single',
      'type': 'folder',
  },
  'product-teaser': {
      'key': 'product-teaser',
      'name': 'Product Teaser',
      'output': i => `<table width="100%" style="border: 1px solid black;">
          <tr>
              <th colspan="2" style="border: 1px solid black; background: lightgray;">Product Teaser</th>
          </tr>
          <tr>
              <td style="border: 1px solid black">SKU</td>
              <td style="border: 1px solid black">${i.sku}</td>
          </tr>
          <tr>
              <td style="border: 1px solid black">Details Button</td>
              <td style="border: 1px solid black">true</td>
          </tr>
          <tr>
              <td style="border: 1px solid black">Cart Button</td>
              <td style="border: 1px solid black">true</td>
          </tr>
      </table>`,
      'selection': 'single',
      'type': 'item',
  },
  'product-carousel': {
      'key': 'product-carousel',
      'name': 'Product Carousel',
      'output': items => `<table width="100%" style="border: 1px solid black;">
          <tr>
              <th style="border: 1px solid black; background: lightgray;">Product Carousel</th>
          </tr>
          <tr>
              <td style="border: 1px solid black">
                  <ul>
                      ${items.map(i => `<li>${i.sku}</li>`).join('')}
                  </ul>
              </td>
          </tr>
      </table>`,
      'selection': 'multiple',
      'type': 'item',
  },
  'category-carousel': {
      'key': 'category-carousel',
      'name': 'Category Carousel',
      'output': items => `<table width="100%" style="border: 1px solid black;">
          <tr>
              <th style="border: 1px solid black; background: lightgray;">Category Carousel</th>
          </tr>
          <tr>
              <td style="border: 1px solid black">
                  <ul>
                      ${items.map(i => `<li>${i.id}</li>`).join('')}
                  </ul>
              </td>
          </tr>
      </table>`,
      'selection': 'multiple',
      'type': 'folder',
  },
};

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");

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
  }, []);

  const onSelectionHandler = (product) => {
    console.log(`Selected product: ${product}`);
    localStorage.setItem('selectedProduct', product);
    onCloseHandler();
  };

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  // Get basic state from guestConnection
  useEffect(() => {
    if (!guestConnection) {
      return;
    }
    const getState = async () => {
      const context = guestConnection.sharedContext;
      const imsToken = context.get("token");
      setToken(imsToken);
      const tempEditorState = await guestConnection.host.editorState.get();
      const { connections, customTokens } = tempEditorState;
      const tempEndpointName = Object.keys(connections).filter((key) =>
        connections[key].startsWith("xwalk:")
      )[0];
      if (tempEndpointName) {
        setEndpoint(connections[tempEndpointName].replace("xwalk:", ""));
        if (customTokens && customTokens[tempEndpointName]) {
          setToken(customTokens[tempEndpointName].replace("Bearer ", ""));
        }
      }
    };
    getState().catch((e) => console.error("Extension error:", e));
  }, [guestConnection]);

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content>
        <Picker
          blocks={blocks}
          getCategories={getCategories}
          getItems={getItems}
          handleSelection={onSelectionHandler}
          handleClose={onCloseHandler}
        />
      </Content>
    </Provider>
  );
}
