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

import React, { useState, useEffect, useCallback } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Heading,
  Provider,
  Content,
  Divider,
  defaultTheme,
  Button,
  View
} from "@adobe/react-spectrum";
import "./UIExtensibilityModal.css";

import { extensionId } from "./Constants";

export default UIExtensibilityModal = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [sharedContext, setSharedContext] = useState(null);

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);
      setSharedContext(connection.sharedContext);
    };

    init().catch(console.error);
  }, []);

  const displayToast = useCallback((toast) => {
    guestConnection.host.toaster.display({
      variant: "positive",
      message: toast,
      timeout: 2500,
    });
  }, [guestConnection]);

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Content width="100%">
        <Heading level={3}>These are some of AEM UI Extensibility features</Heading>
        <Divider size="M" marginBottom="size-200" />
        <View marginBottom="size-150">
          <Button
            onPress={(e) => displayToast("Toast displayed successfully!")}
            variant="primary"
          >
            Show toast
          </Button>
        </View>
        {(sharedContext !== null) &&
          <View marginBottom="size-150">
            <Divider size="S" />
            <Heading level={4} marginTop="size-85" marginBottom="size-85">Shared Context</Heading>
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
        <View UNSAFE_className="more-ui-features-notice">
          More UI Extensibility features coming soon ...
        </View>

        <Button variant="primary" onPress={onCloseHandler} position="fixed" bottom="0px" right="8px">
          Close
        </Button>
      </Content>
    </Provider>
  );
};
