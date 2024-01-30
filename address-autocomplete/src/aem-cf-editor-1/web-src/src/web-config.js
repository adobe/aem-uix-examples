/*
* <license header>
*/

function getGooglePlacesApiKey () {
  return process.env.GOOGLE_PLACES_API_KEY;
}

function getAddressAutocompleteFieldName () {
  return process.env.ADDRESS_AUTOCOMPLETE_FIELD_NAME;
}

export { getGooglePlacesApiKey, getAddressAutocompleteFieldName };
