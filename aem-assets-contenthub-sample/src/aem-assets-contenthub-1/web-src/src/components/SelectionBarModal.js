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
  ListView,
  Item,
} from '@adobe/react-spectrum';

import { extensionId } from './Constants';

export default function SelectionBarModal() {
  const [guestConnection, setGuestConnection] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    (async () => {
      // Read assetIds from the modal URL query — openDialog has no payload channel.
      // contentUrl was `/#selection-bar-modal?assetIds=<json>`.
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const raw = params.get('assetIds');
      setPayload({ assetIds: raw ? JSON.parse(raw) : [] });

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
        <Heading level={3}>Custom Dialog — {payload.assetIds.length} asset{payload.assetIds.length !== 1 ? 's' : ''} selected</Heading>
        <Divider marginY="size-200" />

        <Text><strong>{payload.assetIds.length} asset{payload.assetIds.length !== 1 ? 's' : ''} selected:</strong></Text>
        <View marginTop="size-100" maxHeight="size-3000" overflow="auto">
          <ListView aria-label="Selected assets" items={payload.assetIds.map(id => ({ id }))}>
            {item => (
              <Item key={item.id}>
                <Text UNSAFE_style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.id}</Text>
              </Item>
            )}
          </ListView>
        </View>

        {/* Add your bulk-action logic here */}

        <View marginTop="size-300">
          <Button variant="accent" onPress={() => guestConnection?.host.modal.closeDialog()}>
            Close
          </Button>
        </View>
      </View>
    </Provider>
  );
}
