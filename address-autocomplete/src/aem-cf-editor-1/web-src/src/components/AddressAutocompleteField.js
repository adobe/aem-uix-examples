/*
 * <license header>
 */

import React, { useEffect, useState, useRef } from "react";
import { attach } from '@adobe/uix-guest';
import { extensionId } from './Constants';
import { lightTheme, TextField, Provider, ComboBox, Item } from '@adobe/react-spectrum';
import { useAsyncList } from 'react-stately';

export default () => {
    const [connection, setConnection] = useState();
    const [dataApi, setDataApi] = useState();
    const inputRef = useRef();

    useEffect(() => {
        const init = async () => {
            const connection = await attach({ id: extensionId });
            setConnection(connection);

            const dataApi = await connection.host.dataApi.get();
            setDataApi(dataApi);

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current.getInputElement());
            autocomplete.addListener('place_changed', async () => {
                const place = autocomplete.getPlace();

                if (!place.geometry) {
                    console.error('No details available for input: ' + place.name);
                    return;
                }

                const addressObject = {
                    address: place.formatted_address,
                    city: place.address_components.find(component => component.types.includes('locality')).long_name,
                    state: place.address_components.find(component => component.types.includes('administrative_area_level_1')).short_name,
                    postalCode: place.address_components.find(component => component.types.includes('postal_code')).short_name
                };
                console.log(addressObject);

                await dataApi.setValue("address_autocomplete", addressObject.address);
                await dataApi.setValue("city", addressObject.city);
                await dataApi.setValue("state", addressObject.state);
                await dataApi.setValue("postcode", addressObject.postalCode);
            });

            // workaround
            await connection.host.field.setHeight(270);
        };
        init().catch(console.error);
    }, []);

    const list = useAsyncList({
        async load({ signal, cursor, filterText }) {
            if (!filterText) {
                return;
            }

            const options = [
                {id: 1, name: '2304 Airport Dr, Leander, TX, 78641', address: '2304 Airport Dr', city: 'Leander', state: 'TX', postcode: '78641'},
                {id: 2, name: '11501 Domain Dr #110, Austin, TX, 78758', address: '11501 Domain Dr #110', city: 'Austin', state: 'TX', postcode: '78758'},
            ];
            const result = options.filter(option => option.name.startsWith(filterText));
            console.log(result);

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
        console.log(selectedAddress);

        await dataApi.setValue("address_autocomplete", selectedAddress.address);
        await dataApi.setValue("city", selectedAddress.city);
        await dataApi.setValue("state", selectedAddress.state);
        await dataApi.setValue("postcode", selectedAddress.postcode);
    };

    // onBlur={async () => await connection.host.field.setHeight(70)}
    // onFocus={async () => await connection.host.field.setHeight(100)}

    return (
        <Provider theme={lightTheme} colorScheme="light">
            <TextField
                width={560}
                label="Address"
                ref={inputRef}
            />
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
                {item => <Item key={item.id} textValue={item.name} height="100px">{item.name}</Item>}
            </ComboBox>
        </Provider>
    );
}
