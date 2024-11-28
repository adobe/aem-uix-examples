/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import {useEffect, useState} from "react";
import {attach} from "@adobe/uix-guest";
import {extensionId} from "./Constants";
import {TextField} from "@adobe/react-spectrum";

export default function () {
    const [guestConnection, setGuestConnection] = useState();

    useEffect(() => {
        const init = async () => {
            // connect to the host (ie. CF Editor)
            const conn = await attach({ id: extensionId });
            setGuestConnection(conn);

            // get model
            const model = await conn.host.field.getModel();

            // configure validation state subscriber
            await conn.host.field.onValidationStateChange((state) => setValidationState(state));

            // get default value
            const defaultValue = await conn.host.field.getDefaultValue();
        }

        init().catch(console.error);
    }, []);

    // Custom fileld will be display instead of original one
    return <TextField defaultValue={value} onChange={(v) => conn.host.field.onChange(v)} />;
}
