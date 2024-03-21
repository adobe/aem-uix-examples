import { attach } from "@adobe/uix-guest"
import { useEffect, useState } from 'react'
import { extensionId } from "./Constants"
import { ComboBox, Item, Provider, defaultTheme } from '@adobe/react-spectrum'
import { getDropdownData } from '../utils'
import "./Dropdown.css";

export function  Dropdown() {
  const defaultHeight = 76;
  const [items, setItems] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    (async () => {
      const connection = await attach({ id: extensionId })
      setConnection(connection)
      const auth = await connection.sharedContext.get("auth");
      const token = auth.imsToken;
      const imsOrg = auth.imsOrg;
      const repo = await connection.sharedContext.get("aemHost");
      const url = "bin/releasenotes/customcfdropdown"
      const params = {
        ddType: "content-change-type"
      }
      try {
        const { data } = await getDropdownData(token, repo, imsOrg, url, params);
        setItems(data)
      } catch (e) {
        console.log(`Error fetching data for dropdown`)
      }
    })()
  }, [])

  //see https://react-spectrum.adobe.com/react-spectrum/ComboBox.html
  return (
    <Provider theme={defaultTheme}>
      <div className={'dropdown-field-wrapper'}>
        <ComboBox
          label="Favorite Animal"
          maxWidth="100%"
          minWidth={"auto"}
          UNSAFE_className={"dropdown-field"}
          defaultItems={items}
          onOpenChange={(isOpen, menuTrigger) => {
              if (isOpen) {
                connection.host.field.setHeight(defaultHeight + (items.length * 20))
              } else {
                connection.host.field.setHeight(defaultHeight)
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
