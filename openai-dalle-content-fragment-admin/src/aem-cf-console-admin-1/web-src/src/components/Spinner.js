/*
Copyright 2023 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import React from 'react';
import {
    Flex, Provider, Content, defaultTheme,
    ProgressCircle,
} from '@adobe/react-spectrum';

export default function Spinner(props) {
    return (
        <Provider theme={defaultTheme} colorScheme="light">
            <Content width="100%">

                <Flex alignItems="center" justifyContent="center" height="50vh">
                    <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
                </Flex>
            </Content>
        </Provider>
    );
}