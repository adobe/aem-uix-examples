/*
 * <license header>
 */

import React from 'react';
import { Text } from '@adobe/react-spectrum';
import { register } from '@adobe/uix-guest';
import { extensionId } from './Constants';

const allowedRepos = ['delivery-p137170-e1381935.adobeaemcloud.com'];

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
                'id': 'asset-details-extension-tab-1',
                'tooltip': 'Asset Details Extension Tab',
                'icon': 'Feedback',
                'title': 'Asset Details Extension Tab',
                'contentUrl': '/#asset-details-extension-tab',
              },
            ];
          },
        },
      },
    });
  };
  init().catch(console.error);

  return <Text>IFrame for integration with Host (Content Hub)...</Text>;
}

export default ExtensionRegistration;
