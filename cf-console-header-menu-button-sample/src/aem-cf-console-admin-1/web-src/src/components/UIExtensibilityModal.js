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

import React, { useState, useEffect, useCallback, useRef } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Heading,
  Provider,
  Content,
  Divider,
  defaultTheme,
  ButtonGroup,
  Button,
  Flex,
  View,
  Text
} from "@adobe/react-spectrum";
import Info from "@spectrum-icons/workflow/Info";
import "./UIExtensibilityModal.css";

import { extensionId } from "./Constants";

export default UIExtensibilityModal = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [sharedContext, setSharedContext] = useState(null);

  // A workaround for fixing an issue with the right scroll bar.
  const heightRef = useRef(0);
  const containerRef = useCallback(async (node) => {
    if (node !== null && guestConnection !== null) {
      const height = Number((document.body.clientHeight).toFixed(0));
      if (heightRef.current !== height) {
        heightRef.current = height;
        await guestConnection.host.modal.set({
          height
        });
      }
    }
  }, [guestConnection]);

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);
      setSharedContext(connection.sharedContext);
    };

    init().catch(console.error);
  }, []);

  const displayToast = useCallback((toast, variant) => {
    if (guestConnection !== null) {
      guestConnection.host.toaster.display({
        variant,
        message: toast,
        timeout: 1500,
      });
    }
  }, [guestConnection]);

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Flex
        direction="column"
        ref={containerRef}
      >
        <Content width="100%">
          <Heading level={3}>Check out some of AEM UI Extensibility features</Heading>
          <View marginBottom="size-150">
            <Heading level={4} marginTop="size-85" marginBottom="size-85">Toaster</Heading>
            <View marginBottom="size-85">
              You can use Adobe React Spectrum Toast component to trigger in-app notifications.
            </View>
            <ButtonGroup>
              <Button
                onPress={(e) => displayToast("Toast available!", "neutral")}
                variant="secondary"
              >
                Neutral Toast
              </Button>
              <Button
                onPress={(e) => displayToast("Toast is done!", "positive")}
                variant="primary"
              >
                Positive Toast
              </Button>
              <Button
                onPress={(e) => displayToast("Toast is burned!", "negative")}
                variant="negative"
              >
                Negative Toast
              </Button>
              <Button
                onPress={(e) => displayToast("Toasting…", "info")}
                variant="accent"
                style="outline"
              >
                Info Toast
              </Button>
            </ButtonGroup>
          </View>
          {(sharedContext !== null) &&
            <View marginBottom="size-150">
              <Divider size="S" />
              <Heading level={4} marginTop="size-85" marginBottom="size-85">Shared Context</Heading>
              <View>
                The sharedContext object provides data that enables UI Extensions to execute essential actions, including AEM API calls.
              </View>
              <pre className="shared-context">
                {`
{
  aemHost: "${sharedContext.get("aemHost")}", // string, hostname of connected AEM environment
  locale: "${sharedContext.get("locale")}", // string, locale of current user
  theme: "${sharedContext.get("theme")}", // "light" | "dark", color schema selected by current user
  auth: {
    imsOrg: "${sharedContext.get("auth").imsOrg}", // string, current IMS organization
    imsOrgName: "${sharedContext.get("auth").imsOrgName}", // string, human readable organization name
    apiKey: "${sharedContext.get("auth").apiKey}", // string, API key to use for requests to Adobe services
    authScheme: "${sharedContext.get("auth").authScheme}", // "Bearer", auth schema that should be used during communication with Adobe services
    imsToken: "\${sharedContext.get("auth").imsToken}" // string, user token (not shown here for security reasons)
  }
}
              `}
              </pre>
            </View>
          }
          <Divider size="S" marginBottom="size-150" />
          <Flex UNSAFE_className="more-ui-features-notice" gap="size-75">
            <Info aria-label="Info" /> <Text>More UI Extensibility features coming soon ...</Text>
          </Flex>
        </Content>
        <View position="relative" width="100%" height="size-300" marginBottom="size-150">
          <Button variant="primary" onPress={onCloseHandler} position="absolute" bottom="0" right="size-75">
            Close
          </Button>
        </View>
      </Flex>
    </Provider>
  );
};
