import { attach } from "@adobe/uix-guest"
import { useEffect } from 'react'
import { extensionId } from "./Constants"
import {ComboBox, Item, Provider, defaultTheme} from '@adobe/react-spectrum'
import "./Dropdown.css";

export function  Dropdown() {
  const defaultHeight = 76;
  let connection;
  let items = [
    {name: "one"},
    {name: "two"},
    {name: "three"},
    {name: "four"},
    {name: "five"}
  ];

  useEffect(() => {
    (async () => {
      connection = await attach({ id: extensionId })

      //const auth = connection.sharedContext.get("auth");

      //Example of auth data
      // apiKey: "aem-headless-cf-editor"
      // authScheme: "Bearer"
      // imsOrg: "<orgID>"
      // imsOrgName: "<orgName>"
      // imsToken:"<token"
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
                const height = defaultHeight + (items.length * 20);
                connection.host.field.setStyles({
                  current: { height, },
                  parent: { height, },
                })
              } else {
                connection.host.field.setStyles({
                  current: { height: defaultHeight },
                  parent: { height: defaultHeight },
                })
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
