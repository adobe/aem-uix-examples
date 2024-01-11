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
  defaultTheme,
  Button,
  View
} from "@adobe/react-spectrum";

import { extensionId } from "./Constants";

export default UIExtensibilityModal = () => {
  const [guestConnection, setGuestConnection] = useState();

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);
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

  const displayProgressCircle = useCallback((e) => {
    guestConnection.host.progressCircle.start();
    setTimeout(() => guestConnection.host.progressCircle.stop(), 1500);
  }, [guestConnection]);

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Content width="100%">
        <Heading level={4}>These are some of AEM UI Extensibility features</Heading>
        <View marginBottom="size-150">
          <Button
            onPress={(e) => displayToast("Toast displayed successfully!")}
            variant="primary"
          >
            Show toast
          </Button>
        </View>
        <View>
          <Button
            onPress={displayProgressCircle}
            variant="primary"
          >
            Show Progress Circle
          </Button>
        </View>

        <Button variant="primary" onPress={onCloseHandler} position="fixed" bottom="0px" right="8px">
          Close
        </Button>
      </Content>
    </Provider>
  );
};
