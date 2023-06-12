/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import { attach } from "@adobe/uix-guest"
import {
  Flex,
  Form,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  TextArea,
  ButtonGroup,
  Button
} from '@adobe/react-spectrum'

import allActions from '../config.json'
import actionWebInvoke from '../utils'
import { extensionId } from "./Constants"

export default function ExporttoSlackModal () {
  // Fields
  const [slackMessage, setSlackMessage] = useState('')
  const [guestConnection, setGuestConnection] = useState()
  const { fragments } = useParams()

  // Action state
  const [isNotifying, setIsNotifying] = useState(false)

  if (!(fragments)) {
    console.error("Fragments are missing!")
    return
  }

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId })

      setGuestConnection(guestConnection)
      setSlackMessage(fragments)
      guestConnection.host.modal.set({ loading: false });
    })()
  }, [])

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  const onNotifySlackHandler = async () => {
    setIsNotifying(true)

    const res = await actionWebInvoke(
      allActions['export-to-slack'],
      {},
      {
        'slackText': slackMessage
      }
    )

    if (res.error) {
      console.log(res.error)
      guestConnection.host.toaster.display({ variant: "negative", message: res.error});
    } else {
      console.log(res.message)
      guestConnection.host.toaster.display({ variant: "positive", message: res.message});
    }
    console.log(res)
    setIsNotifying(false)
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content width="100%">
        <Form>
          <TextArea value={slackMessage} height="size-3000" isReadOnly/>

          <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-200">
            {isNotifying && <ProgressCircle size="S" aria-label="Notifying..." isIndeterminate />}
            <ButtonGroup marginStart="size-200">
              <Button variant="primary" onPress={onCloseHandler}>Close</Button>
              <Button variant="cta" onPress={onNotifySlackHandler}>Send</Button>
            </ButtonGroup>
          </Flex>
        </Form>
      </Content>
    </Provider>
  )
}
