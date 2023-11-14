/*
 * <license header>
 */

import React, { useEffect, useState, useRef } from "react";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { lightTheme, TextField, Provider } from "@adobe/react-spectrum";
import googlePlaces from "../google-places";

export default () => {
    const [connection, setConnection] = useState();
    const inputRef = useRef();

    useEffect(() => {
        const init = async () => {
            const connection = await attach({ id: extensionId });
            setConnection(connection);
            const dataApi = await connection.host.dataApi.get();

            inputRef.current.getInputElement().setAttribute("placeholder", await connection.host.field.getDefaultValue());

            googlePlaces(inputRef.current.getInputElement(), async (addressObject) => {
              inputRef.current.getInputElement().value = addressObject.address;

              await dataApi.setValue("city", addressObject.city);
              await dataApi.setValue("state", addressObject.state);
              await dataApi.setValue("postcode", addressObject.postalCode);
            });
        };
        init().catch(console.error);
    }, []);

    return (
        <Provider theme={lightTheme} colorScheme="light">
            <TextField
                width={560}
                label="Address"
                ref={inputRef}
                onBlur={async () => await connection.host.field.setHeight(70)}
                onFocus={async () => await connection.host.field.setHeight(270)}
            />
        </Provider>
    );
};
