/*
 * <license header>
 */

import React, { useState, useEffect } from 'react';
import { attach } from '@adobe/uix-guest';
import {
  Provider,
  defaultTheme,
  View,
  Heading,
  Text,
  Button,
  Divider,
  ProgressCircle,
} from '@adobe/react-spectrum';

import { extensionId } from './Constants';

export default function CardActionModal() {
  const [guestConnection, setGuestConnection] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    (async () => {
      // Read data from the modal URL query — openDialog has no payload channel.
      // contentUrl was `/#card-action-modal?resourceId=...&resourceType=...`.
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      setPayload({ resourceId: params.get('resourceId'), resourceType: params.get('resourceType') });

      // attach() is only needed so the Close button can call host.modal.closeDialog().
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);
    })();
  }, []);

  if (!payload) {
    return (
      <Provider theme={defaultTheme}>
        <View padding="size-400" height="100vh">
          <View UNSAFE_style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <ProgressCircle aria-label="Loading..." isIndeterminate />
          </View>
        </View>
      </Provider>
    );
  }

  return (
    <Provider theme={defaultTheme} height={'100vh'}>
      <View padding="size-400">
        <Heading level={3}>Custom Dialog</Heading>
        <Divider marginY="size-200" />

        <Text><strong>Resource Type:</strong> {payload.resourceType}</Text>
        <Text><strong>Resource ID:</strong></Text>
        <View marginTop="size-100" padding="size-100" backgroundColor="gray-100" borderRadius="regular">
          <Text UNSAFE_style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
            {payload.resourceId}
          </Text>
        </View>

        {/* Add your custom UI here */}

        <View marginTop="size-300">
          <Button variant="accent" onPress={() => guestConnection?.host.modal.closeDialog()}>
            Close
          </Button>
        </View>
      </View>
    </Provider>
  );
}
