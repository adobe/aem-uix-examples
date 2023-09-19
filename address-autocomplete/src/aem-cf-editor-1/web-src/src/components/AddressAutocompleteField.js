/*
 * <license header>
 */

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { attach } from '@adobe/uix-guest';
import { extensionId } from './Constants';
import { lightTheme, TextField, Provider, ComboBox, Item, Flex} from '@adobe/react-spectrum';
import {useAsyncList} from 'react-stately';

const getAddresses = async (value) => {
    const options = [
        {id: 1, name: '2304 Airport Dr, Leander, TX, 78641', address: '2304 Airport Dr', city: 'Leander', state: 'TX', postcode: '78641'},
        {id: 2, name: '11501 Domain Dr #110, Austin, TX, 78758', address: '11501 Domain Dr #110', city: 'Austin', state: 'TX', postcode: '78758'},
    ];
    const filteredOptions = options.filter(option => option.name.startsWith(value));
    return filteredOptions;
};

export default () => {
    const [connection, setConnection] = useState();
    const [dataApi, setDataApi] = useState();

    useEffect(() => {
        const init = async () => {
            const connection = await attach({ id: extensionId });
            setConnection(connection);

            const dataApi = await connection.host.dataApi.get();
            setDataApi(dataApi);
        };
        init().catch(console.error);
    }, []);

    const list = useAsyncList({
        async load({ signal, cursor, filterText }) {
            if (!filterText) {
                return;
            }

            const result = await getAddresses(filterText);
            return {
                items: result,
            };
        },
    });

    const onSelectionChangeHandler = async (key) => {
        if (!key) {
            return;
        }
        const selectedAddress = list.items.find(el => el.id == key);

        await dataApi.setValue("address_autocomplete", selectedAddress.address);
        await dataApi.setValue("city", selectedAddress.city);
        await dataApi.setValue("state", selectedAddress.state);
        await dataApi.setValue("postcode", selectedAddress.postcode);
        await connection.host.field.setHeight(70);
    };

    // onBlur={async () => await connection.host.field.setHeight(70)}
    // onFocus={async () => await connection.host.field.setHeight(100)}

    return (
        <Provider theme={lightTheme} colorScheme="light">
            <ComboBox
                width={560}
                label="Address"
                items={list.items}
                inputValue={list.filterText}
                onInputChange={list.setFilterText}
                loadingState={list.loadingState}
                onLoadMore={list.loadMore}
                onSelectionChange={onSelectionChangeHandler}
            >
                {item => <Item key={item.id} height="100px">{item.name}</Item>}
            </ComboBox>
        </Provider>
    );
}