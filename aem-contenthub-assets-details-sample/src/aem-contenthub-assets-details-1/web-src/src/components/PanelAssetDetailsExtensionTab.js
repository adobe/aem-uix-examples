/*
 * <license header>
 */

import React, { useState, useEffect } from 'react';
import { attach } from '@adobe/uix-guest';
import {
  Flex,
  Provider,
  defaultTheme,
  Text,
  Button,
  View,
  TextField,
  Heading,
  StatusLight
} from '@adobe/react-spectrum';

import { extensionId } from './Constants';

/**
 * Configuration constants
 */
const CONFIG = {
  backendUrl: 'https://274796-chextn-stage.adobeio-static.net/api/v1/web/aem-contenthub-assets-details-1/generic',
  requestTimeout: 30000
};

export default function PanelAssetDetailsExtensionTab() {
  const [guestConnection, setGuestConnection] = useState();
  const [currentAsset, setCurrentAsset] = useState();
  const [taskName, setTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: '' });

  useEffect(() => {
    initializeExtension();
  }, []);

  const initializeExtension = async () => {
    try {
      const guestConnection = await attach({ id: extensionId });
      setGuestConnection(guestConnection);
      
      const asset = await guestConnection.host.assetDetails.getCurrentAsset();
      setCurrentAsset(asset);
    } catch (error) {
      console.error('Error initializing extension:', error);
      setStatus({ type: 'negative', message: 'Failed to initialize extension' });
    }
  };

  const createTaskAndLinkAsset = async () => {
    if (!currentAsset) {
      displayToast('negative', 'Asset not available');
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: '' });

    try {
      const response = await fetch(CONFIG.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'createTaskAndLinkAsset',
          assetId: currentAsset,
          taskName: taskName
        }),
        signal: AbortSignal.timeout(CONFIG.requestTimeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend request failed! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      handleBackendResponse(result);
      
    } catch (error) {
      console.error('Error creating task and linking asset:', error);
      setStatus({ type: 'negative', message: `Error: ${error.message}` });
      displayToast('negative', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackendResponse = (result) => {
    const responseBody = result.body || result;

    if (responseBody && responseBody.success) {
      // Clear any previous status messages
      setStatus({ type: 'info', message: '' });
      displayToast('positive', 'Task created successfully!');
    } else if (responseBody && responseBody.error) {
      setStatus({ type: 'negative', message: `Error: ${responseBody.error}` });
      displayToast('negative', `Failed to create task: ${responseBody.error}`);
    } else {
      // Fallback for unexpected response structure
      setStatus({ type: 'info', message: '' });
      displayToast('positive', 'Task creation completed');
    }
  };

  const displayToast = (variant, message) => {
    if (guestConnection) {
      guestConnection.host.toast.display({ variant, message });
    }
  };

  return (
    <Provider theme={defaultTheme} height={'100vh'}>
      <View backgroundColor="gray-50">
        <View padding="size-300">
          <Heading level={2} marginBottom="size-200">
            Workfront Integration
          </Heading>
          
          <Text marginBottom="size-400">
            Create a Workfront task and link this asset to it.
          </Text>

          <Flex direction="column" gap="size-200" marginBottom="size-400">
            <TextField
              label="Task Name"
              value={taskName}
              onChange={setTaskName}
              placeholder="Enter task name"
            />
          </Flex>

          {status.message && (
            <View marginBottom="size-300">
              <StatusLight variant={status.type}>
                {status.message}
              </StatusLight>
            </View>
          )}

          <Flex justifyContent="center" marginTop="size-400">
            <Button 
              variant="primary" 
              onPress={createTaskAndLinkAsset}
              isDisabled={isLoading || !currentAsset}
            >
              {isLoading ? 'Creating Task...' : 'Create Task & Link Asset'}
            </Button>
          </Flex>
        </View>
      </View>
    </Provider>
  );
}
