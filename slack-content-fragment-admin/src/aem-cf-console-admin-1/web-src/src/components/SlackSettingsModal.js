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
import { attach } from "@adobe/uix-guest"
import {
  Flex,
  Form,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  ButtonGroup,
  Button,
  Heading,
  View,
  IllustratedMessage,
  StatusLight,
  Picker,
  Item,
  TooltipTrigger,
  Tooltip,
  Tabs,
  TabList,
  TabPanels
} from '@adobe/react-spectrum'

import allActions from '../config.json'
import actionWebInvoke from '../utils'
import { extensionId } from "./Constants"

export default function SlackSettingsModal () {
  // Fields
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [guestConnection, setGuestConnection] = useState()
  const [foundSlackWebhook, setFoundSlackWebhook] = useState(false)
  const [foundSlackChannel, setFoundSlackChannel] = useState(false)
  const [foundSlackOAuthToken, setFoundSlackOAuthToken] = useState(false)
  const [slackChannelId, setSlackChannelId] = useState()
  const [slackChannels, setSlackChannels] = useState([])
  const [sharedContext, setSharedContext] = useState()

  // Action state
  const [isLoading, setIsLoading] = useState(false)

  useEffect (() => {
    (async () => {
      const connection = await attach({ id: extensionId })
      setGuestConnection(connection)
      setSharedContext(connection.sharedContext)

      await getSlackConfig().then((result) => {
        if (!result) {
          connection.host.toaster.display({ variant: "negative", message: "Please specify valid Slack Webhook URL, Channel and OAuth Token in your .env file."});
          onHelpHandler()
        }
      })

      connection.host.modal.set({ loading: false });
    })()
  }, [])

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  const onHelpHandler = () => {
    setStatus("Set up Slack App")
    setMessage("https://developer.adobe.com/uix/docs/services/aem-cf-console-admin/code-generation/#configure-demo-application")
  }

  const onImportHandler = async () => {
    setIsLoading(true)
    const res = await actionWebInvoke(
      allActions['import-from-slack'],
      {},
      { 'channelId': slackChannelId },
      { 'method': 'GET' }
    )

    if (res.error) {
      console.log(res.error)
      guestConnection.host.toaster.display({ variant: "negative", message: res.error});
    } else {
      console.log(res.message)
      await createNewFragments(res)
    }
    console.log(res)
    setIsLoading(false)
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content width="100%">
        <Tabs aria-label="Slack Settings" isQuiet>
          <TabList>
            <Item key="status">Status</Item>
            <Item key="import">Import Fragments</Item>
          </TabList>
          <TabPanels>
            <Item key="status">
              <Form>
                <StatusLight variant={foundSlackWebhook ? ('positive') : ('negative')}>{foundSlackWebhook ? ("Slack Webhook URL is set up") : ("Slack Webhook URL is not set up")}</StatusLight>
                <StatusLight variant={foundSlackChannel ? ('positive') : ('negative')}>{foundSlackChannel ? ("Slack Channel is set up") : ("Slack Channel is not set up")}</StatusLight>
                <StatusLight variant={foundSlackOAuthToken ? ('positive') : ('negative')}>{foundSlackOAuthToken ? ("Slack OAuth Token is set up") : ("Slack OAuth Token is not set up")}</StatusLight>
              </Form>
            </Item>
            <Item key="import">
              <Flex width="100%" justifyContent="left" alignItems="end" marginTop="size-200" gap="size-200">
                <Picker
                  label="Select a Slack Channel"
                  items={slackChannels}
                  onSelectionChange={setSlackChannelId}
                  width="40%"
                >
                  {(item) => <Item>{item.name}</Item>}
                </Picker>
                <Flex alignItems="center" gap="size-200">
                  <TooltipTrigger>
                    <Button variant="cta" onPress={onImportHandler}>Import</Button>
                    <Tooltip>Imports a valid Content Fragment (most recent) from the selected Slack Channel.</Tooltip>
                  </TooltipTrigger>
                  {isLoading && <ProgressCircle size="S" aria-label="Loading..." isIndeterminate />}
                </Flex>
              </Flex>
              
              <View height="size-600" />
            </Item>
          </TabPanels>
          <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-200">
            <ButtonGroup marginStart="size-200">
              <Button variant="primary" onPress={onCloseHandler}>Close</Button>
              <Button variant="secondary" onPress={onHelpHandler}>Help</Button>
            </ButtonGroup>
          </Flex>
        </Tabs>
        <View height="size-200" />
        <IllustratedMessage>
          <Heading>{status}</Heading>
          <Content>{message}</Content>
        </IllustratedMessage>
      </Content>
    </Provider>
  )

  async function getSlackConfig() {
    const res = await actionWebInvoke(
      allActions['get-slack-config'],
      {},
      {},
      { 'method': 'GET' }
    )

    if (res.error) {
      console.log(res.error)

      guestConnection.host.toaster.display({ variant: "negative", message: res.error});

    } else {
      if (res.slackWebhook !== '') {
        setFoundSlackWebhook(true)
      }

      if (res.slackChannel !== '') {
        setFoundSlackChannel(true)
      }

      if (res.slackOAuthToken !== '') {
        setFoundSlackOAuthToken(true)
        await getSlackChannels()
      }
    }

    console.log(foundSlackWebhook)
    console.log(foundSlackChannel)
    console.log(foundSlackOAuthToken)

    if (res.slackWebhook === '' || res.slackChannel === '' || res.slackOAuthToken === '') {
      return Promise.resolve(false)
    }

    return Promise.resolve(true)
  }

  async function createNewFragments(resImportFromSlack) {
    const res = await actionWebInvoke(
      allActions['create-new-fragments'],
      {},
      {
        'aemHost': sharedContext.get('aemHost'),
        'authConfig': sharedContext.get('auth'),
        'fragments': resImportFromSlack.fragments
      }
    )

    if (res.error) {
      console.log(res.error)
      guestConnection.host.toaster.display({ variant: "negative", message: res.error});
    } else {
      guestConnection.host.toaster.display({ variant: "positive", message: res.message});
    }
  }

  async function getSlackChannels() {
    const res = await actionWebInvoke(
      allActions['get-slack-channels'],
      {},
      {},
      { 'method': 'GET' }
    )

    if (res.error) {
      console.log(res.error)
      guestConnection.host.toaster.display({ variant: "negative", message: res.error});
    } else {
      setSlackChannels(res.slackChannels)
    }
  }
}
