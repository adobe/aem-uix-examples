/*
* <license header>
*/

export const extensionId = 'sample-extension';

// Mirrors Content Hub's SourceType — the value the host passes as `actionContext.context`.
export const SourceType = {
  ASSETS: 'assets',
  COLLECTION: 'collection',
  COLLECTIONS: 'collections',
  LINK_SHARE: 'share',
};

// Mirrors Content Hub's ResourceType — the value the host passes as `resourceType` in onActionClick.
export const ResourceType = {
  ASSET: 'asset',
  COLLECTION: 'collection',
};
