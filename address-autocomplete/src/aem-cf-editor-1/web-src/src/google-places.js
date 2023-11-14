/*
 * <license header>
 */

import { getGooglePlacesApiKey } from "./web-config";
import { Loader } from "@googlemaps/js-api-loader";

const getCombinedStreetAddress = (place) => {
    const streetNumber = place.address_components.find(component => component.types.includes("street_number"))?.long_name;
    const streetName = place.address_components.find(component => component.types.includes("route"))?.long_name;

    const combinedAddress = (streetNumber ? streetNumber + " " : "") + (streetName ? streetName : "");
    return combinedAddress;
};

export default (element, callback) => {
    new Loader({
        apiKey: getGooglePlacesApiKey(),
        libraries: ["places"],
    })
        .importLibrary("places")
        .then(({ Autocomplete }) => {
            const autocomplete = new Autocomplete(element, {
                types: ["address"],
                componentRestrictions: { country: "US" },
                fields: ["address_components", "formatted_address", "geometry"],
            });
            autocomplete.addListener("place_changed", async () => {
                const place = autocomplete.getPlace();

                if (!place.geometry) {
                    console.log("No details available for input: " + place.name);
                    return;
                }

                const addressObject = {
                    address: getCombinedStreetAddress(place),
                    city: place.address_components.find(component => component.types.includes('locality'))?.long_name,
                    state: place.address_components.find(component => component.types.includes('administrative_area_level_1'))?.short_name,
                    postalCode: place.address_components.find(component => component.types.includes('postal_code'))?.short_name,
                };

                await callback(addressObject);
            });
        })
        .catch((e) => console.log(`Google Maps API script loading error ${e.getError()}`));
};
