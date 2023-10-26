/*
 * <license header>
 */

import React, { useEffect, useState, useRef } from "react";
import { attach } from '@adobe/uix-guest';
import { extensionId } from './Constants';
import { lightTheme, TextField, Provider } from '@adobe/react-spectrum';

const getCombinedStreetAddress = (place) => {
    const streetNumber = place.address_components.find(component => component.types.includes("street_number"))?.long_name;
    const streetName = place.address_components.find(component => component.types.includes("route"))?.long_name;

    const combinedAddress = (streetNumber ? streetNumber + " " : "") + (streetName ? streetName : "");
    return combinedAddress;
};

export default () => {
    const [connection, setConnection] = useState();
    const inputRef = useRef();

    useEffect(() => {
        const init = async () => {
            const connection = await attach({ id: extensionId });
            setConnection(connection);
            const dataApi = await connection.host.dataApi.get();

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current.getInputElement(), {
                types: ['address'],
                componentRestrictions: { country: 'US' },
                fields: ['address_components', 'formatted_address', 'geometry'],
            });
            autocomplete.addListener('place_changed', async (event) => {
                const place = autocomplete.getPlace();

                if (!place.geometry) {
                    console.log('No details available for input: ' + place.name);
                    return;
                }

                const addressObject = {
                    address: getCombinedStreetAddress(place),
                    city: place.address_components.find(component => component.types.includes('locality'))?.long_name,
                    state: place.address_components.find(component => component.types.includes('administrative_area_level_1'))?.short_name,
                    postalCode: place.address_components.find(component => component.types.includes('postal_code'))?.short_name
                };
                console.log(addressObject);

                inputRef.current.getInputElement().value = addressObject.address;
                await dataApi.setValue("city", addressObject.city);
                await dataApi.setValue("state", addressObject.state);
                await dataApi.setValue("postcode", addressObject.postalCode);

                event.preventDefault();
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
                autoComplete="off"
            />
        </Provider>
    );
}
