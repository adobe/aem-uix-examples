/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import { attach } from "@adobe/uix-guest"
import {
  Flex,
  Form,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  Text,
  TextField,
  ButtonGroup,
  Button,
  Heading,
  View
} from '@adobe/react-spectrum'


import { useParams } from "react-router-dom"


import { extensionId } from "./Constants"

export default function CustomActionButtonModal () {
  // Fields
  const [guestConnection, setGuestConnection] = useState()

  const fragmentId = useParams()

  if (!fragmentId) {
    console.error("fragmentId parameter is missing")
    return
  }

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId })

      setGuestConnection(guestConnection)
    })()
  }, [])

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light' id="custom-action-test-modal" UNSAFE_className='CustomActionModal'>
      <Content width="100%">
        <Text id="custom-action-test-modal-text">Action bar modal opened</Text>

        <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
          <ButtonGroup align="end">
            <Button variant="primary" onClick={onCloseHandler} id="custom-action-test-modal-close">Close</Button>
          </ButtonGroup>
        </Flex>
      </Content>
    </Provider>
  )
}
