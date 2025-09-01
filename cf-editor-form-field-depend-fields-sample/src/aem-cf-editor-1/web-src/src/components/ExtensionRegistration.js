/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { generatePath } from "react-router";
import metadata from '../../../../app-metadata.json';
import { getDropdownData, getFieldsData } from "../utils";
import { useExtensionState } from "./useExtensionState";
import { useState, useEffect } from "react";


function ExtensionRegistration() {
  const init = async () => {
    const [_, setItems] = useExtensionState("dd_data");
    const [auth, setAuth] = useState('');
    const [repo, setRepo] = useState('');

    useEffect(() => {
      try {

        const schema = {
          continents: {
            countries: {
              cities: null,
            },
          }
        }
        let initialized = false;
        const schemaIndex = {}
        const isFieldsListReady = () => {
          const keys = Object.keys(schemaIndex);
          for (const element of keys) {
            console.log("schemaIndex[element]",schemaIndex[element]);
            if (schemaIndex[element] === undefined) {
              return false
            }
          }
          return true;
        }
        const getOptionsForField = (field) => {
          console.log("INNNNSIDE", field)
          const params = {}
          let isStarted = false;
          schemaIterator(schema, (element, parent) => {
            if (parent === field) {
              isStarted = true;
              params[element] = {field: parent, value: schemaIndex[parent]}
            } else if (isStarted) {
              params[element] = {field: parent, value: null}
            }
          });
          if (Object.keys(params).length === 0) {
            return
          }
          getFieldsData(auth.imsToken, repo, auth.imsOrg, params)
            .then((data) => {
              schemaIterator(schema, (element, parent) => {
                if (data[element]) {
                  localStorage.setItem(`${element}-options`, JSON.stringify({value: data[element] || [], date: Date.now()}))
                }
              })
            })
        }
        const getOptionsList = () => {
          const params = {}
          schemaIterator(schema, (element, parent) => {
            console.log("schemaIndex[parent]", schemaIndex, parent)
            if (schemaIndex[parent]) {
              params[element] = {field: parent, value: schemaIndex[parent]}
            } else {
              params[element] = null
            }
          })
          console.log("paramsparamsparams", params, schemaIndex);
          getFieldsData(auth.imsToken, repo, auth.imsOrg, params)
            .then((data) => {
              schemaIterator(schema, (element, parent) => {
                if (data[element]) {
                  localStorage.setItem(`${element}-options`, JSON.stringify({value: data[element] || [], date: Date.now()}))
                }
              })
            })
        }


        const schemaIterator = (schema, callback, parent) => {
          const keys = Object.keys(schema);
          for (const element of keys) {
            callback(element, parent);

            if (schema[element]) {
              schemaIterator(schema[element], callback, element)
            }
          }
        }
        schemaIterator(schema, (element, parent) => {schemaIndex[element] = undefined})

        const handler = (event) => {
          schemaIndex[event.key] = JSON.parse(event.newValue).value;
          if (!initialized && isFieldsListReady()) {
            initialized = true
            getOptionsList()
          } else if (!initialized) {
            console.log("not ready yet")
          } else if (initialized) {
            console.log("getOptionsForField", event)
            getOptionsForField(event.key)
          }
        }

        window.addEventListener('storage', handler, false);

      } catch (e) {
        console.error("Error in schema", e)
      }
    }, []);

    const guestConnection = await register({
      id: extensionId,
      metadata,
      methods: {
        field: {
          getDefinitions: async () => {
            console.log("IN GET DEFINITIONS!!!")
            const [auth, repo, dataApi] = await Promise.all([
              guestConnection.sharedContext.get("auth"),
              guestConnection.sharedContext.get("aemHost"),
              guestConnection.host.dataApi.get(),
            ]).catch((e) => {
              console.error("Failed retrieving data from host", e);
            });
            setAuth(auth);
            setRepo(repo);
            //dsdsdsds
            // const path = "bin/releasenotes/customcfdropdown"
            // try {
            //   // getDropdownData(auth.imsToken, repo, auth.imsOrg, path, params)
            //   // console.log('333333333----');
            //
            //   getFieldsData(auth.imsToken, repo, auth.imsOrg, path, {})
            //     //Now we are ready to share the date with other fields, compex data need to be serialized:
            //     .then((data) => setItems(JSON.stringify(data)))
            //   //console.log('4444444444----');
            //
            // } catch (e) {
            //   console.error(`Error fetching data for dropdown`, e)
            // }


            // for (let key in schema) {
            //   schema[key].enumeration = items[key] || [];
            // }
            return ([
            {
              fieldNameExp: 'radioButtonsField',
              url: "/index.html#"+generatePath("/dropdown-route/:fieldName", {
                fieldName: 'continents',
              }),
              overlay: true,
            },
            {
              fieldNameExp: 'enumeration',
              url: "/index.html#"+generatePath("/dropdown-route/:fieldName", {
                fieldName: 'countries',
              }),
              overlay: true,
            },
            {
              fieldNameExp: 'multidrop',
              url: "/index.html#"+generatePath("/dropdown-route/:fieldName", {
                fieldName: 'cities',
              }),
              overlay: true,
            },
          ])},
        },
      }
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
