/*
 * <license header>
 */

import React from 'react';
import { Text } from '@adobe/react-spectrum';
import { register } from '@adobe/uix-guest';
import { extensionId, SourceType } from './Constants';

const allowedRepos = ['your-repo-name'];

function getRepo() {
  const search = new URLSearchParams(window.location.search);
  return search.get('repo');
}

function shouldSkipRegistration(repo) {
  return !allowedRepos.includes(repo);
}

function ExtensionRegistration() {
  const repo = getRepo();

  if (shouldSkipRegistration(repo)) {
    return <Text>IFrame for integration with Host (Content Hub), Skipped registration as repo is not allowed</Text>;
  }

  console.log(`Register extension for ${repo}`);

  const init = async () => {
    const guestConnection = await register({
      id: extensionId,
      methods: {
        assetDetails: {
          getTabPanels() {
            // YOUR SIDE PANELS CODE SHOULD BE HERE
            return [
              {
                'id': 'asset-details-extension-tab',
                'tooltip': 'Asset Details Extension Tab',
                'icon': 'Extension',
                'title': 'Asset Details Extension Tab',
                'contentUrl': '/#asset-details-extension-tab',
              },
            ];
          },
        },
        card: {
          getActionButtons(actionContext) {
            // YOUR CARD ACTION BUTTONS CODE SHOULD BE HERE
            // context is SourceType.ASSETS (asset cards) or SourceType.COLLECTIONS (collection tiles).
            const { context } = actionContext || {};
            return [
              {
                'id': 'customId',
                'label': context === SourceType.COLLECTIONS ? 'Collection label' : 'Asset label',
                'icon': 'Form',
              },
            ];
          },
          async onActionClick(resourceType, buttonId, resourceId) {
            if (buttonId === 'customId') {
              await guestConnection.host.modal.openDialog({
                title: 'Custom Dialog',
                contentUrl: `/#card-action-modal?resourceId=${encodeURIComponent(resourceId)}&resourceType=${encodeURIComponent(resourceType)}`,
                type: 'modal',
                size: 'M',
              });
            }
          },
        },
        selectionBar: {
          getActionButtons() {
            // YOUR SELECTION BAR ACTION BUTTONS CODE SHOULD BE HERE
            return [
              {
                'id': 'customId',
                'label': 'Custom label',
                'icon': 'Form',
              },
            ];
          },
          async onActionClick(buttonId, assetIds) {
            if (buttonId === 'customId') {
              await guestConnection.host.modal.openDialog({
                title: 'Custom Dialog',
                contentUrl: `/#selection-bar-modal?assetIds=${encodeURIComponent(JSON.stringify(assetIds))}`,
                type: 'modal',
                size: 'M',
              });
            }
          },
        },
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (Content Hub)...</Text>;
}

export default ExtensionRegistration;
