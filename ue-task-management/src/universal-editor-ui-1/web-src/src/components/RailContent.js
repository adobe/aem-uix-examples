/*
 * <license header>
 */

import React from "react";
import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useParams } from 'react-router-dom';

export default () => {
    const { railId } = useParams();
    if (!railId) {
        console.error('Rail id parameter is missed');
        return;
    }

    return (
        <Provider theme={lightTheme} colorScheme="light">
            Content generate by the extension Rail#{railId}
        </Provider>
    );
};
