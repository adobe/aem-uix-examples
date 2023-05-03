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