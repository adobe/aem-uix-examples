/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import React, { useEffect, useState } from "react";
import { attach } from "@adobe/uix-guest";
import { Heading, Text, View, Divider, ProgressCircle } from "@adobe/react-spectrum";
import { extensionId } from "./Constants";

function ActionModal() {
    const [aemHost, setAemHost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const guestConnection = await attach({ id: extensionId });
            const host = await guestConnection.sharedContext.get('aemHost');
            setAemHost(host);
            setLoading(false);
        };
        init().catch(console.error);
    }, []);

    if (loading) {
        return (
            <View padding="size-400" UNSAFE_style={{ textAlign: 'center' }}>
                <ProgressCircle aria-label="Loading..." isIndeterminate />
            </View>
        );
    }

    return (
        <View padding="size-400">
            <Heading level={3}>Sample Action</Heading>
            <Divider marginBottom="size-300" />
            <Text>The extension is active on this environment.</Text>
            {aemHost && (
                <View marginTop="size-200">
                    <Text><strong>AEM Host:</strong> {aemHost}</Text>
                </View>
            )}
        </View>
    );
}

export default ActionModal;
