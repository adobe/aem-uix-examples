/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import {useParams} from "react-router-dom";
import {lightTheme, Provider, Text} from "@adobe/react-spectrum";
import {extensionId} from "./Constants";
export default () => {
    const {railId} = useParams();
    console.log('### Rail id parameter is ', railId);
    if (!railId) {
        console.error('Rail id parameter is missed');
        return;
    }

    return (
        <Provider theme={lightTheme} colorScheme="light" id="right-rail-custom">
            <Text>Content generate by the extension Rail#{railId}</Text>
        </Provider>
    );
}
