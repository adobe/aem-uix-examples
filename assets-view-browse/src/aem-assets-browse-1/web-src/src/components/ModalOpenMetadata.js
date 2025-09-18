/*
 * <license header>
 */

import React, { useState, useEffect } from 'react';
import { attach } from '@adobe/uix-guest';
import {
  Flex,
  Provider,
  defaultTheme,
  Link,
  Text,
  ButtonGroup,
  Button,
  View,
  Heading,
  Divider,
  Grid,
  ProgressCircle,
  Well
} from '@adobe/react-spectrum';

import { extensionId } from './Constants';
import { getAssetMetadata } from '../utils';

export default function ModalOpenMetadata() {
  // Fields
  const [guestConnection, setGuestConnection] = useState();
  const [colorScheme, setColorScheme] = useState('light');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      (async () => {
        try {
          const guestConnection = await attach({ id: extensionId });
          setGuestConnection(guestConnection);
          const aemHost = await guestConnection.host.discovery.getAemHost();

          const { colorScheme } = await guestConnection.host.theme.getThemeInfo();
          setColorScheme(colorScheme);
          const payload = await guestConnection.host.modal.getPayload();
          const asset = payload?.resources?.[0];

          const metadataResponse = await getAssetMetadata(guestConnection, aemHost, asset.id, asset.path);
          console.log(JSON.stringify(metadataResponse));
          setMetadata(metadataResponse);
        } catch (err) {
          console.error('Error fetching metadata:', err);
          setError(err.message || 'Failed to fetch metadata');
        } finally {
          setLoading(false);
        }
      })()
    }, []);

  function closeDialog() {
    guestConnection.host.modal.closeDialog();
  }

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Helper function to render metadata section
  const renderMetadataSection = (title, data) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <View marginBottom="size-300">
        <Well>
          <Grid columns={['1fr', '2fr']} gap="size-100">
            {Object.entries(data).map(([key, value]) => {
              let displayValue = value;
              
              // Format specific fields
              if (key === 'repo:size') {
                displayValue = formatFileSize(value);
              } else if (key.includes('Date') || key.includes('date')) {
                displayValue = formatDate(value);
              } else if (Array.isArray(value)) {
                displayValue = value.join(', ');
              } else if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value);
              } else if (typeof value === 'boolean') {
                displayValue = value ? 'Yes' : 'No';
              }
              
              return (
                <React.Fragment key={key}>
                  <Text><strong>{key}:</strong></Text>
                  <Text>{String(displayValue)}</Text>
                </React.Fragment>
              );
            })}
          </Grid>
        </Well>
      </View>
    );
  };

  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme}>
      <View minHeight="400px">

        {loading && (
          <Flex justifyContent="center" alignItems="center" height="200px">
            <ProgressCircle aria-label="Loading metadata..." isIndeterminate />
          </Flex>
        )}
        
        {error && (
          <View marginBottom="size-300">
            <Text>Error loading metadata: {error}</Text>
          </View>
        )}
        
        {metadata && !loading && (
          <View>
            {/* Asset ID */}
            {metadata.assetId && (
              <View marginBottom="size-300">
                <Heading level={3} marginBottom="size-200">Asset ID</Heading>
                <Well>
                  <Text>{metadata.assetId}</Text>
                </Well>
              </View>
            )}
            
            {/* Repository Metadata */}
            {renderMetadataSection('Repository Metadata', metadata.repositoryMetadata)}
            
            {/* Asset Metadata */}
            {renderMetadataSection('Asset Metadata', metadata.assetMetadata)}
          </View>
        )}
        
        <Divider marginY="size-300" />
        
        <Flex justifyContent="center">
          <ButtonGroup>
            <Button variant="primary" onPress={() => closeDialog()}>Close</Button>
          </ButtonGroup>
        </Flex>
      </View>
    </Provider>
  );
}
