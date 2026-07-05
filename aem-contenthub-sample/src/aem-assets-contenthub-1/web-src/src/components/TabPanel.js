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
  ProgressCircle,
  Divider,
} from '@adobe/react-spectrum';

import { extensionId } from './Constants';
import actions from '../config.json';

export default function TabPanel() {
  const [guestConnection, setGuestConnection] = useState(null);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Reconnect to the registered extension.
        // extensionId must match the id used in register() — both come from Constants.js.
        const connection = await attach({ id: extensionId });
        setGuestConnection(connection);

        // getCurrentAsset() returns the asset id as a plain string (e.g. "urn:aaid:aem:...").
        const assetId = await connection.host.assetDetails.getCurrentAsset();
        setAsset({ id: assetId });

        // ── Call a web action with the asset ID ─────────────────────────────────
        // Uncomment and customize for AEM API calls:
        //
        // const { accessToken, imsOrg } = await connection.host.auth.getIMSInfo();
        // const apiKey = await connection.host.auth.getApiKey();
        // const aemHost = await connection.host.discovery.getAemHost();
        // const actionUrl = actions['aem-assets-contenthub-1/generic'];
        //
        // const response = await fetch(actionUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ assetId, aemHost, apiKey, imsOrg }),
        // });
        // const data = await response.json();

      } catch (err) {
        console.error('Panel initialization error:', err);
        setError('Failed to initialize panel: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function displayToast(variant, message) {
    if (guestConnection) {
      guestConnection.host.toast.display({ variant, message });
    }
  }

  if (loading) {
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
    <Provider theme={defaultTheme}>
      <View padding="size-400">
        <Heading level={3}>Extension Template</Heading>

        <Divider marginY="size-200" />

        {error && (
          <View marginBottom="size-200" backgroundColor="negative" padding="size-100" borderRadius="regular">
            <Text>{error}</Text>
          </View>
        )}

        {asset && (
          <View marginBottom="size-200">
            <Text><strong>Asset ID:</strong></Text>
            <View marginTop="size-100" padding="size-100" backgroundColor="gray-100" borderRadius="regular">
              <Text UNSAFE_style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                {asset.id}
              </Text>
            </View>
          </View>
        )}

        <Button
          variant="accent"
          marginTop="size-300"
          onPress={() => displayToast('positive', 'Custom action!')}
        >
          Show Toast
        </Button>
      </View>
    </Provider>
  );
}
