import { attach } from "@adobe/uix-guest"
import { useEffect, useState, useRef } from 'react'
import { extensionId } from "./Constants"
import { ComboBox, Item, Provider, defaultTheme } from '@adobe/react-spectrum'
import { getDropdownData } from '../utils'
import "./Dropdown.css";

export function  Dropdown() {
  const textInputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [connection, setConnection] = useState(null);
  const [model, setModel] = useState({});
  const [value, setValue] = useState('');
  const [dataApi, setDataApi] = useState(null)
  const [configurations, setConfigurations] = useState({})
  const [loading, setLoading] = useState("loading")
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      const connection = await attach({ id: extensionId })
        .catch((e) => console.error("Failed to establish connection with host", e))
      setConnection(connection);
      const [auth, repo, dataApi, model, defaultValue] = await Promise.all([
        connection.sharedContext.get("auth"),
        connection.sharedContext.get("aemHost"),
        connection.host.dataApi.get(),
        connection.host.field.getModel(),
        connection.host.field.getDefaultValue(),
      ]).catch((e) => {
        console.error("Failed retrieving data from host", e)
      });
      setConfigurations(connection.configuration)
      setDataApi(dataApi)
      setModel(model);
      setValue(defaultValue.value)

      try {
        const { data } = await getDropdownData(
          auth.imsToken,
          repo,
          auth.imsOrg,
          "bin/releasenotes/customcfdropdown",
          {
            ddType: "content-change-type"
          }
        );
        setLoading('')
        setItems(data)
      } catch (e) {
        setError(`Error fetching data for dropdown`);
        setLoading("error")
        console.error(`Error fetching data for dropdown`, e)
      }
    })()
  }, [])

  //see https://react-spectrum.adobe.com/react-spectrum/ComboBox.html
  return (
    <Provider theme={defaultTheme}>
      <div className={'dropdown-field-wrapper'}>
        <ComboBox
          label={model.fieldLabel}
          errorMessage={error}
          loadingState={loading}
          maxWidth="100%"
          minWidth={"auto"}
          validationState={error ? "invalid" : "valid"}
          ref={textInputRef}
          UNSAFE_className={"dropdown-field"}
          defaultItems={items}
          isRequired={model.required}
          inputValue={value}
          direction={"bottom"}
          onSelectionChange={(v) => {
            setValue(v)
            dataApi.setValue(model.name, v);
          }}
          onOpenChange={(isOpen, menuTrigger) => {
              if (isOpen) {
                connection.host.field.setHeight(textInputRef.current.UNSAFE_getDOMNode().clientHeight + (items.length * 40))
              } else {
                connection.host.field.setHeight(textInputRef.current.UNSAFE_getDOMNode().clientHeight)
              }
            }
          }
        >
          {item => <Item key={item.name}>{item.name}</Item>}
        </ComboBox>
      </div>
    </Provider>
  )
}
