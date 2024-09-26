/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import React, { useEffect, useState } from "react";
import { attach } from "@adobe/uix-guest";
import { ComboBox, Item, Provider, lightTheme } from "@adobe/react-spectrum";
import { extensionId } from "./Constants";

export default function () {
  const [guestConnection, setGuestConnection] = useState();

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId });

      setGuestConnection(guestConnection);
    })();
  }, []);

  const onSelectionChangeHandler = async (variable) => {
    const selectedOption = options.find(el => el.id == variable);

    await guestConnection.host.rte.applyInstructions([{
      type: "insertContent",
      value: '{' + selectedOption.name + '}'
    }]);
    guestConnection.host.rte.closeWidget();
  };

  const options = [
    {id: "1", name: 'Aerospace'},
    {id: "2", name: 'Mechanical'},
    {id: "3", name: 'Civil'},
  ];

  return (
    <Provider theme={lightTheme} colorScheme="light">
      <ComboBox
        label="RTEWidgetCFEditor"
        defaultItems={options}
        onSelectionChange={onSelectionChangeHandler} autoFocus>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    </Provider>
  );
}
