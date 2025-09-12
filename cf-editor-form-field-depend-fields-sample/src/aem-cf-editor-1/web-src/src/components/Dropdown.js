import { attach } from "@adobe/uix-guest"
import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom"
import { extensionId } from "./Constants"
import { ComboBox, Item, Provider, lightTheme } from '@adobe/react-spectrum'
import "./Dropdown.css";

export function  Dropdown() {
  const textInputRef = useRef(null);

  // Using hook to get the data from other frame
  const [items, setItems] = useState([]);
  const [connection, setConnection] = useState(null);
  const [model, setModel] = useState({});
  const [value, setValue] = useState('');
  const [dataApi, setDataApi] = useState(null)
  const [loading, setLoading] = useState("loading")
  const [error, setError] = useState(null)
  const { fieldName } = useParams();

  const handler = (event) => {
    if (event.key === `${fieldName}-options`) {
      const newValue = JSON.parse(event.newValue)
      if (!newValue.value) {
        setItems([]);
        setValue('');
      } else {
        setItems(newValue.value)
        if (!newValue.value.find((item) => item.value === JSON.parse(localStorage.getItem(fieldName)).value)) {
          setValue('')
        }
      }
    }
  }

  useEffect(() => {
    try {
      window.addEventListener('storage', handler, false);
      return () => {
        window.removeEventListener('storage', handler, false);
      }
    } catch (e) {}
  }, []);

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
      setDataApi(dataApi)
      setModel(model);
      setValue(defaultValue)
      localStorage.setItem(fieldName, JSON.stringify({value: defaultValue, date: Date.now()}))
    })()
  }, [])

  // Removing loading indicator only when registration frame got some data
  useEffect(() => {
    if (items.length > 0) {
      setLoading(null);
    }
  }, [items]);

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <div className={'dropdown-field-wrapper'}>
        <ComboBox
          label={fieldName}
          errorMessage={error}
          loadingState={loading}
          isReadOnly={!!loading || !items.length || !!error}
          maxWidth="100%"
          minWidth={"auto"}
          validationState={error ? "invalid" : "valid"}
          ref={textInputRef}
          UNSAFE_className={"dropdown-field"}
          defaultItems={items}
          isRequired={model.required}
          selectedKey={value}
          direction={"bottom"}
          onSelectionChange={(v) => {
            console.log("SET VALUE123", value, v)
            setValue(v)
            dataApi.setValue(model.name, v);
            localStorage.setItem(fieldName, JSON.stringify({value: v, date: Date.now()}))
          }}
          onOpenChange={async(isOpen, menuTrigger) => {
            if (isOpen) {
              const position = await connection.host.field.getBoundingClientRect()
              let height;
              const spaceToBottomWithPadding = position.viewportHeight - position.bottom - 10;
              if (items.length > 5 && spaceToBottomWithPadding < textInputRef.current.UNSAFE_getDOMNode().clientHeight + 200) {
                height = textInputRef.current.UNSAFE_getDOMNode().clientHeight + 200
              } else if (spaceToBottomWithPadding < textInputRef.current.UNSAFE_getDOMNode().clientHeight + (items.length * 40)) {
                height = spaceToBottomWithPadding
              } else {
                height = textInputRef.current.UNSAFE_getDOMNode().clientHeight + (items.length * 40)
              }
              connection.host.field.setStyles({
                current: {
                  height: height,
                  zIndex: 10
                }
              });
            } else {
              connection.host.field.setStyles({
                current: {
                  height: textInputRef.current.UNSAFE_getDOMNode().clientHeight,
                  zIndex: 1
                }
              });
            }
          }
          }
        >
          {item => <Item key={item.value}>{item.name}</Item>}
        </ComboBox>
      </div>
    </Provider>
  )
}
